# Create application with ZetaPush
-------------------------------------------------------------------------------

Hello !

I will show you how to quickly create an application that allows you to share photos in real time inside a private and ephemeral social network.

ZetaPush is a back-end framework that allows you to create a serverless application using high level and remotely hosted services.

On this application, we will use 3 services :

 - [stack](https://doc.zetapush.com/#_stack) &rarr; store messages in database
 - [messaging](https://doc.zetapush.com/#_messaging) &rarr; send message on channel in realtime by websocket
 - [groups](https://doc.zetapush.com/#_groups) &rarr; create groups to group users
 - [filesystem](https://doc.zetapush.com/#_zpfs_hdfs) &rarr; manage files on ZetaPush platform

We will cover these steps:

1. Installing ZetaPush and creating a new application.
2. Developing worker API (worker is used as interaction between the ZetaPush platform and your front).
3. Writing UI and worker interaction.
4. Run locally.
5. Deploy to production.

## Installing ZetaPush and creating a new application
-------------------------------------------------------------------------------

As any web project based on node.js, you need to install npm and node.
If you haven't done it already, learn how to install Node.js and npm [here](https://www.npmjs.com/get-npm).

Now, you must create an account on ZetaPush platform, for this,
[CONTACT US](https://www.zetapush.com/sign-up-for-a-free-trial).

After that, you will receive a login and a password.

To create project from command line
```console
npm init @zetapush my-buzz-night
```

ZetaPush CLI asks for a developer login and a developer password : you received them after contacting us on our website.

Let's make sure everything is working properly with the generated project :

```console
cd my-buzz-night
npm run start -- --serve-front
```

## Developing worker API
-------------------------------------------------------------------------------

Remember what the application should do :

- Expose a page where users can create an event (with name, date and location) and share the event link with their friends.
- On event page, get event details and pictures history, and expose a button to send picture.

Technically, that's what our worker has to do :

- Generate an unique eventID. There are many way to do this, here we choose to parse a randomly generated number in string as a base number 36.

```js
private generateEventID(): string {
    return Math.random().toString(36).substring(2);
}
```

- Create event if it doesn't already exist by generating new eventID. With this eventID, create group to users and a stack to store data. Stack's tail will represent the details of the event.

```js
async createEvent(event: MyEvent): Promise<string> {
    const eventID = this.generateEventID();
	const { exists } = await this.groups.exists({ group: eventID });

    if (exists)
        return this.createEvent(event);
    await this.groups.createGroup({
        group: eventID
    });
    await this.stack.push({
        stack: eventID,
        data: event
    });
    return eventID;
}
```

- Join the event by adding the user to the group corresponding to the event, and get messages history.

```js
async joinEvent(eventID: string): Promise<joinEventResponse> {
    const { exists } = await this.groups.exists({ group: eventID });

    if (!exists)
        return null;
    await this.groups.addUser({
        group: eventID,
        user: this.requestContext.owner
    });
    const { result } = await this.stack.list({
        stack: eventID
    });

    if (!result || !result.content.length)
        return null;
    return {
        event: result.content.pop(), // event information at the bottom of stack
        messages: result.content.map(x => { // the rest of the stack contains messages
            return {
                data: x.data.url,
                ts: x.ts
            };
        })
    };
}
```

- Send message on channel refering to eventID, store it in database with stack service.

```js
async sendMessage(eventID: string, url: any) {
    const group: GroupUsers = await this.groups.groupUsers({
        group: eventID
    });
    const users: string[] = group.users || [];
    const data: StackItem = {
        data: url,
        ts: Date.now()
    }

    console.log('message:', data); // worker will log all messages in terminal
    this.messaging.send({
        channel: eventID,
        target: users,
        data
    });
    await this.stack.push({
        stack: eventID,
        data: { url }
    });
}
```

- Check if the image has not already been uploaded on filesystem, if so, delete it, and ask ZetaPush platform for an upload URL.

```js
async getImageUploadURL(eventID: string, name: string, type: string): Promise<FileUploadLocation> {
    /* complex path on filesystem to avoid same filename */
    const path = `/${eventID}_${this.requestContext.owner}_${name}_${Date.now()}`;
    const file = await this.hdfs.stat({ path });

    if (file.entry)
        await this.hdfs.rm({ path });
    return await this.hdfs.newUploadUrl({
        contentType: type,
        path
    });
}
```

- From image GUID, get image URL from filesystem

```js
async getImageURL(guid: string): Promise<string> {
    const request = await this.hdfs.newFile({
        guid
    });

    return request.url.url;
}
```

- ... And that's all !

We put these 6 methods in a class in `worker/index.ts` :

```js
/* import ZetaPush Services and types */
import { Messaging, Groups, GroupUsers, Stack, StackItem, Zpfs_hdfs, FileUploadLocation } from '@zetapush/platform-legacy';
import { Injectable, Context } from '@zetapush/core';

const HACK = <any>(Zpfs_hdfs);
HACK.DEPLOYMENT_OPTIONS = {
	upload_user_provides_filename: true,
	upload_thumbnails: '80'
};

@Injectable()
export default class Api {

    private requestContext: Context;

    constructor(
		private messaging: Messaging,
		private groups: Groups,
		private stack: Stack,
		private hdfs: Zpfs_hdfs,
    ) {}

    /* insert the 6 methods here */

}
```

In this worker class :

- requestContext is ((insert explanation from doc))
- HACK.DEPLOYMENT_OPTIONS is ((insert explanation from doc))

## Writing UI and worker interaction
-------------------------------------------------------------------------------

You are free to implement your own UI so we won't explain how to code a form that asks for a name, date and event location, or a button that calls function on click with HTML/CSS (you can steal our UI to quickly finish this tutorial).

We choose [Angular](https://angular.io) to develop our front but you can follow this tutorial with another framework.

In an Angular service class used as interaction with worker :

- Create the ZetaPush client (credentials are injected) and a ProxyTaskService to bridge with ZetaPush platform.

```js
constructor() {
    this.client = new WeakClient();
    this.api = this.client.createProxyTaskService();
}
```

Now, with `api`, you can call worker-side methods (respecting its name).

For exemple : if you have a worker-side `foo()` method, just call `api.foo()` on the front side. Same way if you have a worker-side `bar(id, name)` method that take parameters, just call `api.bar(42, 'Person')`, and parameters are transmitted.

- Call `joinEvent` method at worker-side to get messages history and details of the event.
- Create service to listen incoming messages on the channel 'eventID' from the worker.

```js
/* Call me after parsing URL to get eventID : http://localhost:4200/#/event/<eventID> */
async joinEvent(eventID: string): Promise<joinEventResponse> {
    const eventData = await this.api.joinEvent(eventID) as joinEventResponse;

    if (!eventData)
        return null;
    await this.client.createService({
        Type: Messaging,
        listener: {
            /* 'channelName': yourCallbackForEachMessageReceived */
            [eventID]: ({ data }) => this.observer.next(data.data)
        }
    });
    return eventData;
}
```

The callback will receive the data sent by each call to `sendMessage` on the worker side, and adds a new image in the html for each received message.

- Ask platform for an upload URL.
- Upload the file (HTTP).
- Ask platform for image url.
- Send message on channel to share image url.

```js
/* Call me when you click on `send` with file from HTML form in parameter */
async sendImage(eventID: string, file: File) {
    const transfer: FileUploadLocation = await this.api.getImageUploadURL(
        eventID,
        file.name,
        file.type
    );

    /*
     * Feel free to upload file as you want, here we use XMLHttpRequest API.
     * HTTP method and URL use for upload is in `transfer`.
     */
    await this.upload(transfer, file);
    const url = await this.api.getImageURL(transfer.guid);
    await this.api.sendMessage(eventID, url);
}
```

## Run locally
-------------------------------------------------------------------------------

Build Angular application :

```console
npm run build -- --prod
```

Run your worker locally, and run local http server to serve your front code.

ZetaPush CLI will ask you for a developer login and a developer password : you received them after contacting us on our website.

```console
npm run start -- --serve-front
```

## Deploy to production
-------------------------------------------------------------------------------

This command will send your worker and front code to ZetaPush cloud servers.
First, stop the local worker with a (CTRL+C).

At the end of the deployment, ZetaPush CLI exposes front URL : share it with your friends !

```console
npm run deploy
```

That's it, you've deployed your first application on ZetaPush.
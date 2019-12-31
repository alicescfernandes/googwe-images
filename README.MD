_i like to write theese, even if it is for colege projects._

_This projects are usually hard, and give alot more work that it seems, it is only fair that i at least document some of it. So here it comes..._

# Colors and histograms
[todo]

# Searching by image similarities
[todo]

# Workers, workers, how did you manage to get this running with workers...

Well, this is where things get wild...Let me tell you, it was an adventure.

So, workers are a fancy new javascript functionality, available in all modern browsers, that allow you to run javascript in diferent context of your main js. If you have a java background, it works almost as a thread **(except that javascript in-browser doesn't have threads)** and it has a more restrict context, such that there's no ``document.body`` available inside workers, there'se even no ``window`` inside workers (if you want to access the global scope of a worker, you use the ``this`` keyword within the worker javascript file, in fact, when you do this, the devtools console gently gives you a ``DedicatedWorkerGlobalScope`` object, not a ``window`` as in normal javascript context execution)

So, how to the workers comunicate with the main javascript? The workers are indeed instatiated within a javascript file. You just create a ``Worker`` object, and pass in the url of a javascript file, and you have a worker.

Once you have that worker running, you can send messages to the worker via ``postMessage`` and receive messages with the ``message`` event

The most basic worker example would be:

- For the main js file
```js
const worker = new Worker('worker.js');


worker.addEventListener("message",function(e){
    console.log("received from worker",e)
})

worker.postMessage("bar")
```

- For the worker file
```js
this.onmessage = function(e) {
    console.log("received from main",e)
}

this.postMessage("foo")
```
And that's all there is to it.
## Now, in my implementation...

### Oh God, there was trouble... and this is how i fixed it
This dynamic adds asynchronous events to the equation, so in my particular case, i had to wrap this communication in promises. I'm not going to the details on how i got this with promises, but let me tell you, it's. a. pain. Each one of this promises resolves whenever i get a message from the worker.

And there's also the added problem of adding multiple event listeners to the save event, and you end up calling functions for repeaded events. In order to solve this, you add a main event listener, and register the callbacks on a separate functions with id's, and just make the worker post-message with that id, and on the client side, you use that id to trigger the callback registered to that id. Confusing right?

![confused travolta](https://media.giphy.com/media/hEc4k5pN17GZq/source.gif)

Even i was, and that's how i manage to solve it!

### Worker doing ~~meth~~ math:
What i do is to send some values to the worker, the worker performs some ridiculous math stuff (that takes in alot of numbers, and performs some very long loops), and sends me back those results. Putting this on a diagram would look like this
[image here]

While this takes some computing power, the advantage is that this is not render-blocking, and you would just navigate on the page without almost noticing (but you computer would be on steroids when doing this operations). 
Initially this was on the main js file, and it sucked, because my page would just freeze for a while, and the just return to normal. Now at least i can get some fancy animation going. I believe that there isn't an actual perfomance improvement when doing this via workers, the biggest advantage is that you avoid your script being render blocking, but i haven't measured any perfomace so, i don't really now if this represents any perfomance optimization.


Workers and Promises go hand in hand (or maybe not, if you don't want to use promises).

_I beleive that this is as more technical as it can get. I will present you with MDN documentation links, so you can have your geek moment_


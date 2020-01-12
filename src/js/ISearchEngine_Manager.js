//Declaring a global variable which will be created in main function 
const app = new ISearchEngine("xml/database_parsed.xml",true);
const noResults = "<span class='search-no-results'><p>Your search criteria didn't match any results.</p></span>"

let requestingInfiniteScroll = false;

//Main function
function main() {
    let canvas = document.querySelector("canvas");
    app.init(canvas);
    document.querySelector(".delete-on-load").remove()
    window.location.hash = "";

    let search_inputs = Array.prototype.slice.call(document.getElementsByClassName("search_input"))
    search_inputs.forEach(function(el) {
        el.addEventListener("input",function(e) {
            document.getElementById("search_input").value = e.target.value;
            search_inputs.forEach(function(el) {
                el.value = document.getElementById("search_input").value;
            })
        })

        el.addEventListener("keydown",function(e) {
            if(e.keyCode == 13) {
                document.querySelector(".search_submit").click() //trigger a click on the search button
            }
        })
    })

    let search_submits = Array.prototype.slice.call(document.getElementsByClassName("search_submit"))
    search_submits.forEach(function(el) {
        el.addEventListener("click",function(e) {
            //Search similarity is priority
            if(document.querySelector(".search-box-input-with-image")) {
                var cnv = document.querySelector("canvas");
                var ch = new ColorHistogram(app.redColor,app.greenColor,app.blueColor);
                var cn = new ColorMoments()
                var ev = new Event("processed_picture")

                var p = new Picture(0,0,0,0,document.querySelector(".search-box-input-image img").src,"",false)

                p.computation(cnv,ch,cn,ev).then((data) => {
                    let results = app.searchISimilarity(p)

                    //document.querySelector(".color-search").classList.remove('width89');
                    //document.querySelector(".color-search").classList.add('transform-scale-0');
                    e.preventDefault();
                    document.querySelector(".search-results").innerHTML = `<span class="search-load-more">
                        <div></div>
                        <div></div>
                        <div></div>
                    </span>`;
                    paintResults(results)
                    window.location.hash = "#/results"

                });
                return;
            }

            let query = document.getElementById("search_input").value
            let color = document.getElementById("search_color").value

            if(query != "") {

                window.location.hash = "#/results"
                //document.querySelector(".color-search").classList.remove('width89');
                //document.querySelector(".color-search").classList.add('transform-scale-0');
                let results = app.search(query,color)
                e.preventDefault();
                document.querySelector(".search-results").innerHTML = `<span class="search-load-more">
                <div></div>
                <div></div>
                <div></div>
            </span>`;
                paintResults(results)
            }

        })
    })


    let search_images_file = Array.prototype.slice.call(document.getElementsByClassName("choose_image"))
    search_images_file.forEach(function(el) {
        el.addEventListener("click",function(e) {
            document.getElementById("search_image").click()
        })
    })

    //Image research removal
    let close_images = Array.prototype.slice.call(document.getElementsByClassName("search-box-input-image-close"))
    close_images.forEach(function(el) {
        el.addEventListener("click",function(e) {
            let search_images = Array.prototype.slice.call(document.getElementsByClassName("search-box-input-with-image"))
            search_images.forEach(function(el) {
                el.classList.remove("search-box-input-with-image")
                if(document.getElementById("search_input").value == "") {
                    window.location.hash = "";
                }
            })
        })
    })

    //Simple Infinite scroll
    const scrollTreshold = 400 //px
    window.addEventListener("scroll",function(e) {
        let scroll = document.body.getClientRects()[0].top;
        let height = document.body.getClientRects()[0].height - window.innerHeight;
        if(Math.abs(scroll + height) <= scrollTreshold && requestingInfiniteScroll == false) {
            requestingInfiniteScroll = true;
            let images = app.loadMore();
            if(images.length > 0) {
                paintResults(images)
            }
        }
    })

    //Routing
    window.addEventListener("hashchange",function() {
        if(this.window.location.hash == "#/results") {
            this.document.body.classList.add("page-results");
        } else if(this.window.location.hash == "#/loading") {
            this.document.body.classList.add("page-loading");
        } else {
            this.document.body.classList.remove("page-results");
            this.document.body.classList.remove("page-loading");
        }
    });

    //Construct the color list filter 
    const colors = app.hexColor.map(function(e,idx) { //map colors to span elements
        idx = idx - 1; //transparent is not a color on the histogram graph
        return `<span data-color-idx="${idx}" data-color="${e}" style="background-color:${e}" class="color-search-item"></span>`
    }).join("");

    Array.prototype.slice.call(document.querySelectorAll(".color-search")).forEach(function(el) {
        //Add event listeners and replicate between "Pages"
        el.addEventListener("click",function(e) {
            if(e.target.classList.contains("color-search-item")) {

                //Propagate the selection for all stuff
                if(document.querySelector(".hide-if-results .color-search-item-selected")) {
                    document.querySelector(".hide-if-results .color-search-item-selected").classList.remove("color-search-item-selected")
                }

                if(document.querySelector(".show-if-results .color-search-item-selected")) {
                    document.querySelector(".show-if-results .color-search-item-selected").classList.remove("color-search-item-selected")
                }

                document.querySelector(`.show-if-results [data-color="${e.target.dataset.color}"]`).classList.add("color-search-item-selected");
                document.querySelector(`.hide-if-results [data-color="${e.target.dataset.color}"]`).classList.add("color-search-item-selected");

                //Set the value
                document.querySelector("#search_color").value = e.target.dataset.colorIdx;
                if(e.target.dataset.colorIdx === "-1") {
                    document.querySelector("#search_color").value = "";

                } else {
                    document.querySelector("#search_color").value = e.target.dataset.colorIdx;
                }

            }
        })
        el.innerHTML = colors;
    });

    document.body.addEventListener("dragover",function(e) {
        e.preventDefault();
    })

    document.body.addEventListener("drop",function(ev) {
        ev.preventDefault();
        var file = ev.dataTransfer.files[0]
        searchByImage(file)
    })

    document.getElementById("search_image").addEventListener("change",function(ev) {
        var file = ev.target.files[0]
        searchByImage(file);
    })

}

function searchByImage(file) {
    document.querySelector(".page-search .loading-animation").style.display ="flex";
    var image = new Image();
    image.file = file
    console.log(file)
    if(file.type.match("image")) {
        const reader = new FileReader();
        reader.onload = function(e) {

            image.src = e.target.result;

            Array.prototype.slice.call(document.querySelectorAll(".search-box-input")).forEach((el) => {
                el.classList.add("search-box-input-with-image");
            })

            Array.prototype.slice.call(document.querySelectorAll(".search-box-input-image")).forEach((el) => {
                el.querySelector("img").src = image.src;
                el.querySelector("p").textContent = image.file.name;
            })

            var cnv = document.querySelector("canvas");
            var ch = new ColorHistogram(app.redColor,app.greenColor,app.blueColor);
            var cn = new ColorMoments()
            var ev = new Event("processed_picture")

            var p = new Picture(0,0,0,0,image.src,"",false)

            p.computation(cnv,ch,cn,ev).then((data) => {
                let results = app.searchISimilarity(p)
                
                //document.querySelector(".color-search").classList.remove('width89');
                //document.querySelector(".color-search").classList.add('transform-scale-0');
                document.querySelector(".search-results").innerHTML = `<span class="search-load-more">
                <div></div>
                <div></div>
                <div></div>
                </span>`;
                paintResults(results)
                document.querySelector(".page-search .loading-animation").style.display = "none";
                window.location.hash = "#/results"
            });
        };
        reader.readAsDataURL(file);
    } else {
        console.log("this is not an image")
    }
}

function toggledDarkMode() {
    if(document.querySelector("body").dataset.mode == "dark") {
        document.querySelector("body").dataset.mode = "light"
    } else {
        document.querySelector("body").dataset.mode = "dark"
        console.log("U2ltIExlbywgaXN0byBz428gbWFyaXF1aWNlcyE=");
    }
}
function onImageLoaded(event){
    event.target.style.marginTop = -1 * (event.target.getClientRects()[0].height - 220) / 2 + "px"
    event.target.classList.add("image-loaded")
    event.target.style.animationDelay = 50 * event.target.dataset.idx + "ms"
}

//Function to make the image list on the results page
function paintResults(results,) {
    results.forEach((element,idx) => {
        let searchItem = `<div class="search-result">
                            <div class="search-result-image" style="background-color:${element.dominantColor};">
                                <img data-idx="${idx}"onload="onImageLoaded(event)"class="search-result-image-content" src="${element.impath}"></img>
                            </div>
                            <div class="search-result-meta">
                                <p>${element.title}</p>
                                <span class="search-result-meta-color" style="background-color: ${element.dominantColor};"></span>
                                <span class="search-result-meta-width">
                                    ${element.imgobj.width} &#10005 ${element.imgobj.height} pixels
                                </span>
                            </div>
                        </div>`

        document.querySelector(".search-load-more").insertAdjacentHTML("beforebegin",searchItem)

    });

    if(results.length == 0) {
        document.querySelector(".search-load-more").insertAdjacentHTML("beforebegin",noResults)
    }

    if(results.length < app.itemsPerPage) {
        this.document.querySelector(".search-load-more").remove()
    }


    requestingInfiniteScroll = false;
}
//Function that generates an artificial image and draw it in canvas
//Useful to test the image processing algorithms
function Generate_Image(canvas) {
    var ctx = canvas.getContext("2d");
    var imgData = ctx.createImageData(100,100);

    for(var i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i + 0] = 204;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = 0;
        imgData.data[i + 3] = 255;
        if((i >= 8000 && i < 8400) || (i >= 16000 && i < 16400) || (i >= 24000 && i < 24400) || (i >= 32000 && i < 32400))
            imgData.data[i + 1] = 200;
    }
    ctx.putImageData(imgData,150,0);
    return imgData;
}


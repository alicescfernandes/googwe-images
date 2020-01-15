'use strict';

class ISearchEngine {
    constructor(dbase,fastLoad = false) {
        //Pool to include all the objects (mainly pictures) drawn in canvas 
        this.allpictures = new Pool(1500);
        this.localStorageKey = "images"
        this.itemsPerPage = 20;
        this.currentPage = 0;
        this.queryResults = []
        this.fastLoad = fastLoad
        //Array of color to be used in image processing algorithms
        this.colors = ["red", "orange", "yellow", "green", "Blue-green", "blue", "purple", "pink", "white", "grey", "black", "brown"];

        // Red component of each color
        this.redColor = [204, 251, 255, 0,     3, 0, 118, 255, 255, 153, 0, 136];
        // Green component of each color
        this.greenColor = [0, 148, 255, 204,    192, 0, 44, 152, 255, 153, 0, 84];
        // Blue component of each color
        this.blueColor = [0, 11, 0, 0,         198, 255, 167, 191, 255, 153, 0, 24];
        this.hexColor = ["#00000000","#cc0000","#fb940b","#ffff00","#00cc00","#03c0c6","#0000ff","#762ca7","#ff98bf","#ffffff","#999999","#000000","#885418"]
        //List of categories available in the image database
        this.categories = ["beach", "birthday", "face", "indoor", "manmade/artificial", "manmade/manmade", "manmade/urban", "marriage", "nature", "no_people", "outdoor", "party", "people", "snow"];

        //Name of the XML file with the information related to the images 
        this.XML_file = dbase;

        // Instance of the XML_Database class to manage the information in the XML file 
        this.XML_db = new XML_Database();
        
        // Instance of the LocalStorageXML class to manage the information in the LocalStorage 
        this.LS_db = new LocalStorageXML();

        //Number of images per category for image processing
        this.num_Images = 1;
        //Number of images to show in canvas as a search result
        this.numshownpic = 35;

        //Width of image in canvas
        this.imgWidth = 190;
        //Height of image in canvas
        this.imgHeight = 140;
    }

    //Method to initialize the canvas. First stage it is used to process all the images
    init(cnv) {
        //this.databaseProcessing(cnv);
        this.createXMLIExampledatabaseLS()
    }

    // method to build the database which is composed by all the pictures organized by the XML_Database file
    // At this initial stage, in order to evaluate the image algorithms, the method only compute one image.
    // However, after the initial stage the method must compute all the images in the XML file
    databaseProcessing(cnv) {
        //Images processing classes
        let h12color = new ColorHistogram(this.redColor, this.greenColor, this.blueColor);
        
        let colmoments = new ColorMoments();

        let img = new Picture(0, 0, 100, 100, "Images/daniel1.jpg", "test");

        //Creating an event that will be used to understand when image is already processed
        let eventname = "processed_picture_" + img.impath;
        let eventP = new Event(eventname);
        let self = this;
        document.addEventListener(eventname, function() {
            //self.imageProcessed(img, eventname);
        }, false);

        //img.computation(cnv, h12color, colmoments, eventP);
    }

    imageProcessed(img, eventname) {
        this.allpictures.insert(img);
    }

    //Method to create the XML database in the localStorage for color queries
    /*createXMLColordatabaseLS() {
        // this method should be completed by the students
    }*/

    //Method to create the XML database in the localStorage for Image Example queries
    createXMLIExampledatabaseLS() {
        var cnv = document.querySelector("canvas");
        var ch = new ColorHistogram(this.redColor,this.greenColor,this.blueColor);
        var cn = new ColorMoments()
        var ev = new Event("processed_picture")
        var self = this;
        if(this.fastLoad == true){
            this.XML_db.loadXMLfile(this.XML_file).then((doc) => {
                localStorage.setItem(this.localStorageKey,doc.documentElement.outerHTML);          
                var doc = this.LS_db.readLS_XML(this.localStorageKey);
                var images = doc.querySelectorAll("image")
                for(let i = 0; i < images.length; i++) {
                    let a = new Picture(0,0,0,0,images[i],images[i].getAttribute("keywords"))
                    a.setColorMoments(JSON.parse(images[i].getAttribute("colorMoments")))
                    a.setManhattan(JSON.parse(images[i].getAttribute("histogram")))
                    this.imageProcessed(a)
                }
            })
        }else{
            if(localStorage.getItem(this.localStorageKey) && this.fastLoad == false){
                //Make the pool from the localStorage, and put the loaded values
                var doc = this.LS_db.readLS_XML(this.localStorageKey);
                var images = doc.querySelectorAll("image")
                for(let i = 0; i < images.length; i++) {
                    let a = new Picture(0,0,0,0,images[i],images[i].getAttribute("keywords"))
                    a.setColorMoments( JSON.parse(images[i].getAttribute("colorMoments") ) ) 
                    a.setManhattan(JSON.parse(images[i].getAttribute("histogram")) )
                    this.imageProcessed(a)
                }

                //this.zscoreNormalization();

            }else{
                this.XML_db.loadXMLfile(this.XML_file).then((doc) => {
                    window.location.hash = "#/loading";
                    //Process  the xml
                    var images = doc.querySelectorAll("image")

                    let promises = [];
                    for(let i = 0; i < images.length; i++) {
                        let keywords = images[i].querySelector("title").textContent.toLowerCase().replace(/ -/g,"").replace(/ /g,",")
                        let a = (new Picture(0,0,0,0,images[i], keywords)).computation(cnv,ch,cn,ev)
                        images[i].querySelector("latitude").remove()
                        images[i].querySelector("longitude").remove()
                        images[i].querySelector("date").remove()
                        a.then((data) => {
                            console.count("resolved")
                            images[i].setAttribute("dominantColor",data.dominantColor)
                            images[i].setAttribute("colorMoments",JSON.stringify(data.color_moments))
                            images[i].setAttribute("histogram",JSON.stringify(data.hist))
                            images[i].setAttribute("width",data.imgobj.width)
                            images[i].setAttribute("height",data.imgobj.height)
                            images[i].setAttribute("keywords",data.keywords)
                            //self.imageProcessed(images[i])
                            self.imageProcessed(data)
                        });
                        promises.push(a)

                    }
                    Promise.all(promises).then(() => {
                        this.LS_db.saveLS_XML(this.localStorageKey,doc.documentElement.outerHTML)
                        window.location.hash = "";
                        //this.zscoreNormalization();
                    })
                })
            }
        }

    }

    //A good normalization of the data is very important to look for similar images. This method applies the
    // zscore normalization to the data
    zscoreNormalization() {
        let overall_mean = [];
        let overall_std = [];

        // Inicialization
        for (let i = 0; i < this.allpictures.stuff[0].color_moments.length; i++) {
            overall_mean.push(0);
            overall_std.push(0);
        }

        // Mean computation I
        for (let i = 0; i < this.allpictures.stuff.length; i++) {
            for (let j = 0; j < this.allpictures.stuff[0].color_moments.length; j++) {
                overall_mean[j] += this.allpictures.stuff[i].color_moments[j];
            }
        }

        // Mean computation II
        for (let i = 0; i < this.allpictures.stuff[0].color_moments.length; i++) {
            overall_mean[i] /= this.allpictures.stuff.length;
        }

        // STD computation I
        for (let i = 0; i < this.allpictures.stuff.length; i++) {
            for (let j = 0; j < this.allpictures.stuff[0].color_moments.length; j++) {
                overall_std[j] += Math.pow((this.allpictures.stuff[i].color_moments[j] - overall_mean[j]), 2);
            }
        }

        // STD computation II
        for (let i = 0; i < this.allpictures.stuff[0].color_moments.length; i++) {
            overall_std[i] = Math.sqrt(overall_std[i] / this.allpictures.stuff.length);
        }

        // zscore normalization
        for (let i = 0; i < this.allpictures.stuff.length; i++) {
            for (let j = 0; j < this.allpictures.stuff[0].color_moments.length; j++) {
                this.allpictures.stuff[i].color_moments[j] = (this.allpictures.stuff[i].color_moments[j] - overall_mean[j]) / overall_std[j];
            }
        }
    }

    //Method to search images based on a selected color
    //This is search is based on css rules, nothing about this is right. 
    //Because javascript  engine is better at querying than our code with for-loops and for-each
    /*searchColor(category, color) {
        let keyword = `image[dominantColor*="${color}"]`
        let doc = this.LS_db.readLS_XML(this.localStorageKey)
        return doc.documentElement.querySelectorAll(keyword);
    }*/

    search(search_query,color) {
        this.currentPage = 0;
        let doc = this.LS_db.readLS_XML(this.localStorageKey);
        let keyword = search_query.trim().split(" ").join("|")  //OR regex
        let regex = RegExp(keyword, "g")
        
        //Match pictures by keywords and sort them by color
        let results = this.allpictures.stuff.filter(element => {
            return element.keywords.match(regex)  != null;
        });
        
        //Order results by color dominance
        if(color != ""){
            color = parseInt(color)
            
            let maxColor = []
            this.allpictures.stuff.forEach(function(el) {
                maxColor = maxColor.concat(el.hist);
            });
            maxColor = Math.max(...maxColor);

            results = this.sortByHistogramDistance(color, results)
        }

        this.queryResults = results;   
        return this.loadMore()
    }
    loadMore() {
        var  currentPage = this.currentPage;
        var nextPage = this.currentPage + 1;
        this.currentPage++;
        return this.queryResults.slice(this.itemsPerPage * currentPage,this.itemsPerPage * nextPage)
    }

    //Method to search images based on keywords
    //This is search is based on css rules, nothing about this is right
    //Because javascript  engine is better at querying than our code with for-loops and for-each
    /*searchKeywords(search_query) {
        search_query = search_query.split(" ");
        let keyword = search_query.map((el) => `image[keywords*="${el}"]`).join(",")
        console.log(keywords)
        let doc = this.LS_db.readLS_XML(this.localStorageKey)
        return doc.documentElement.querySelectorAll(keyword);
    }*/

    //Method to search images based on Image similarities
    searchISimilarity(img1) {
        var results = []
        //Query the pool with the similarities
        for(let k in this.allpictures.stuff){
            var p = this.calcManhattanDist(img1,this.allpictures.stuff[k])
            results.push( [p,this.allpictures.stuff[k]] )
        }   

        this.currentPage = 0;
        this.queryResults = this.sortByColorMoments(results).map(function(el) {
            return el[1]
        });
        return this.loadMore()
    }

    //Method to compute the Manhattan difference between 2 images which is one way of measure the similarity
    //between images.
    calcManhattanDist(img1, img2) {
        debugger;
        let manhattan = 0;

        for (let i = 0; i < img1.color_moments.length; i++) {
            for(let x = 0; x < img1.color_moments[i].length; x++){
                manhattan += Math.abs(img1.color_moments[i][x] - img2.color_moments[i][x]);
            }
        }
        manhattan /= img1.color_moments.length;
        return manhattan;
    }

    //Method to sort images according to the Manhattan distance measure
    sortByHistogramDistance(idx, list) {
        return list.sort(function(a,b) {
            return b.hist[idx] - a.hist[idx];
        });

    }

    //Method to sort images according to the number of pixels of a selected color
    sortByColorMoments(list) {
        return  list.sort(function(a, b) {
            return a[0] - b[0];
        });

    }

    //Method to visualize images in canvas organized in columns and rows
    //Student: i'm not using this
    gridView(canvas) {
        // this method should be completed by the students
    }

}


class Pool {
    constructor(maxSize) {
        this.size = maxSize;
        this.stuff = [];

    }

    insert(obj) {
        if (this.stuff.length < this.size) {
            this.stuff.push(obj);
        } else {
            alert("The application is full: there isn't more memory space to include objects");
        }
    }

    remove() {
        if (this.stuff.length !== 0) {
            this.stuff.pop();
        } else {
            alert("There aren't objects in the application to delete");
        }
    }

    empty_Pool() {
        while (this.stuff.length > 0) {
            this.remove();
        }
    }
}


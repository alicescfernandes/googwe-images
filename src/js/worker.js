// Red component of each color
const redColor = [204,251,255,0,3,0,118,255,255,153,0,136];
// Green component of each color
const greenColor = [0,148,255,204,192,0,44,152,255,153,0,84];
// Blue component of each color
const blueColor = [0,11,0,0,198,255,167,191,255,153,0,24];

var R = 0;
var G = 1;
var B = 2;
var ALPHA = 3;

class ColorHistogram {
    constructor(redColor,greenColor,blueColor) {
        this.redColor = redColor;
        this.greenColor = greenColor;
        this.blueColor = blueColor;
        this.threshold = 400;
    }

    count_Pixels(pixels) {
        // this method should be completed by the students
        let colorDistances = Array(this.redColor.length);

        //Iterate on each 4 pixels
        for(let p = 0; p != pixels.length; p += 4) {
            let distances = this.calculateManhattan(pixels[p],pixels[p + 1],pixels[p + 2]) //Returns a 12 item array

            //Check the 12 item array distances, and increment on the colors
            distances.forEach((distances,idx) => {
                let [distance,dRed,dGreen,dBlue] = distances;
                if( distance < 400) {
                    colorDistances[idx] = (colorDistances[idx] + 1) || 1
                }/*else{
                    colorDistances[idx] = 0;
                }*/
            })
        }
        return colorDistances
        //For each group of four, calculate the manhattan distance for each color bar

    }

    calculateManhattan(r,g,b) {
        let distances = []
        for(let k = 0; k != this.redColor.length; k++) {
            let dRed = Math.abs(r - this.redColor[k])
            let dGreen = Math.abs(g - this.greenColor[k])
            let dBlue = Math.abs(b - this.blueColor[k])

            //Calculate Manhattan Distance
            distances.push([dRed + dGreen + dBlue,dRed,dGreen,dBlue])
        }

        return distances

    }
}

class ColorMoments {
    constructor() {
        this.h_block = 3;
        this.v_block = 3;
    }

    rgbToHsv(rc,gc,bc) {
        let r = rc / 255;
        let g = gc / 255;
        let b = bc / 255;

        let max = Math.max(r,g,b);
        let min = Math.min(r,g,b);
        let h = null,s = null,v = max;

        let dif = max - min;
        s = max == 0 ? 0 : dif / max;

        if(max == min) {
            h = 0;
        } else {
            switch(max) {
                case r:
                    h = (g - b) / dif + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / dif + 2;
                    break;
                case b:
                    h = (r - g) / dif + 4;
                    break;
            }
            h /= 6;
        }
        return [h,s,v];
    }

    moments(blocks) { //Recieves 9 block
        var promesas = []
        for (let block in blocks){            
            promesas.push(this.calculateMonents(blocks[block]))
        }
        return promesas
    }

    calculateMonents(pixels) {
        var self = this;
        let medianHue = 0;
        let medianValue = 0;
        let medianSaturation = 0;
        let medianAlpha = 0;
        let pixelsPerColor = (pixels.length / 4);
        let varHue = 0;
        let varSaturation = 0;
        let varValue = 0;
        let varAlpha = 0;
        //let test = []
        for(let p = 0; p < pixels.length; p += 4) {
            var [h,s,v] = self.rgbToHsv(pixels[p],pixels[p + G],pixels[p + B]);

            medianHue = medianHue + h
            medianValue = medianValue + s
            medianSaturation = medianSaturation + v
            //varHue = varHue + (h ** 2)
            //varSaturation = varSaturation + (s ** 2)
            //varValue = varValue + (v ** 2)
            //test.push(h)
        }
        medianHue = medianHue / (pixels.length / 4)
        medianValue = medianValue / (pixels.length / 4)
        medianSaturation = medianSaturation / (pixels.length / 4)

        debugger;

        for(let p = 0; p < pixels.length; p += 4) {
            var [h,s,v] = self.rgbToHsv(pixels[p],pixels[p + G],pixels[p + B]);
            varHue = varHue + ( (h - medianHue) ** 2)
            varSaturation = varSaturation + ( (s - medianSaturation) ** 2)
            varValue = varValue + ((v - medianValue) ** 2)
            //test.push(h)
        }

        //varHue = (varHue - (pixelsPerColor * (medianHue ** 2))) / (pixelsPerColor - 1)
        //varSaturation = (varSaturation - (pixelsPerColor * (medianSaturation ** 2))) / (pixelsPerColor - 1)
        //varValue = (varValue - (pixelsPerColor * (medianValue ** 2))) / (pixelsPerColor - 1)

        varHue = Math.sqrt(varHue / (pixelsPerColor - 1)) || 0;
        varSaturation = Math.sqrt(varSaturation / (pixelsPerColor - 1)) || 0;
        varValue = Math.sqrt(varValue / (pixelsPerColor - 1)) || 0;

        //varAlpha = (varAlpha - (pixelsPerColor * (medianAlpha ** 2))) / (pixelsPerColor - 1)
        //console.log(pixelsPerColor)
        //resolve([medianHue,medianSaturation,medianValue,varHue,varSaturation,varValue])
        return [medianHue,medianSaturation,medianValue,varHue,varSaturation,varValue]
    }
}

let ch = new ColorHistogram(redColor,greenColor,blueColor)
let cm = new ColorMoments()

this.onmessage = function(e) {
    let data= e.data.data
    let command = e.data.command
    let result = ""

    switch(command){
        case "calculate_manhattan":
            result = ch.count_Pixels(data) //manhattan(data)
            this.postMessage({result:"manhattan_result",data:result})
        break;
        case "calculate_moment":
            result = cm.moments(data) //manhattan(data)
            this.postMessage({ result: "moment_result",data: result })
            break;

        case "calculate_all":
            var array = new Uint32Array(1);
            this.crypto.getRandomValues(array)[0];
            
            var obj = {
                result: "all_result",id: e.data.id,data: [ch.count_Pixels(e.data.pixels),cm.moments(e.data.blocks)]
            }
            this.postMessage(obj)
            break;
        default:
            this.console.log("command not recognized")
    }
    /*result = ch.count_Pixels(data) //manhattan(data)
    this.console.log("worker result",result)
    postMessage(result);*/
}

import { FormData, Blob } from "formdata-node";
import { FormDataEncoder } from "form-data-encoder";
import {Readable} from "stream"
import fetch from "node-fetch"

// To use previous step data, pass the `steps` object to the run() function
export default defineComponent({
  async run({ steps, $ }) {
    // Return data to use it in future steps
    const url = "https://api.web3.storage/upload";

    let sensorData = {
        "device_pinValue": steps.trigger.event.body.decoded.payload.unique_code
    };
    console.log(sensorData);
    let form = new FormData();
    let blob = new Blob([new TextEncoder().encode(JSON.stringify(sensorData))], { type: "application/json;charset=utf-8" });
    console.log(blob);
    
    form.append('file', blob, steps.trigger.event.body.uuid + ".json");
    console.log(form);
    const encoder = new FormDataEncoder(form)

    const key = "web3APIKEY"
    const options = {
      method: "post",
      headers: Object.assign({}, encoder.headers, {"Authorization": "Bearer "+ key}),
      body: Readable.from(encoder)
    }


    const resp = await fetch(url, options);
    const text = await resp.text()
    console.log(text);
    return resp;
  },
})

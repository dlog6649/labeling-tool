import { takeLatest } from "redux-saga/effects"
import { taker } from "../../../common/modules/util"
import axios from "axios"
import { PayloadAction } from "@reduxjs/toolkit"
import { GET_IMAGE, GET_IMAGES } from "./index"

// CORS 프록시 URL
// const proxyurl = "https://cors-anywhere.herokuapp.com/"

export function* labelingSaga() {
  yield taker(takeLatest, GET_IMAGES, () => axios.get("https://jsonplaceholder.typicode.com/photos"))
  yield taker(takeLatest, GET_IMAGE, (action: PayloadAction<string>) =>
    axios.get(`https://jsonplaceholder.typicode.com/photos/${action.payload}`),
  )
}

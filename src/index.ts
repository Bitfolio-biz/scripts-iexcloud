#!/usr/bin/env node
require('dotenv').config();
import axios from 'axios';
import {InfluxDB, Point, HttpError} from '@influxdata/influxdb-client';
import { hostname } from 'os';
const authToken = process.env.AUTH_TOKEN;
const org = 'bitfolio';
//const url = "http://mon-influxdb.monitoring:8086"
const url = "http://localhost:8086"
if (!authToken) {
    throw new Error('AUTH_TOKEN for iex api is not defined');
}
const iexUrl = "https://cloud.iexapis.com/stable/stock/market/batch?symbols=gbtc,"
+ "ethe&types=quote&range=1m&last=1&token=" + authToken
//console.log(iexUrl)

setInterval(() => {
    console.log(iexUrl)
    axios.get(iexUrl)
        .then((response) => {
            var open = response.data.GBTC.quote.open
            var close = response.data.GBTC.quote.close
            var closeTime = response.data.GBTC.quote.closeTime
            var latestUpdate = response.data.GBTC.quote.latestUpdate
            var latestPrice = response.data.GBTC.quote.latestPrice
            var latestVolume = response.data.GBTC.quote.latestVolume
            var lastTradeTime = response.data.GBTC.quote.lastTradeTime
            var avgTotalVolume = response.data.GBTC.quote.avgTotalVolume
            var marketCap = response.data.GBTC.quote.marketCap
            var calculationPrice = response.data.GBTC.quote.calculationPrice

            if (!open) {
                //throw new Error('open price is not found!');
                console.log('open price is not found!')
            } else {
                const writeApi = new InfluxDB({ url }).getWriteApi(org, 'stocks', 's')
                writeApi.useDefaultTags({location: hostname()})
                const point1 = new Point('gbtc')
                    .tag('symbol', 'gbtc')
                    .tag('calculationPrice', calculationPrice)
                    .floatField('open', open)
                    .floatField('close', close)
                    .intField('closeTime', closeTime)
                    .floatField('latestPrice', latestPrice)
                    .intField('latestVolume', latestVolume)
                    .intField('latestUpdate', latestUpdate)
                    .intField('lastTradeTime', lastTradeTime)
                    .intField('avgTotalVolume', avgTotalVolume)
                    .floatField('marketCap', marketCap)
                writeApi.writePoint(point1)
                
                console.log("Wrote gbtc: price " + latestPrice + ", volume" 
                + latestVolume + ", time " + latestUpdate)

                open = response.data.ETHE.quote.open
                close = response.data.ETHE.quote.close
                closeTime = response.data.ETHE.quote.closeTime
                latestUpdate = response.data.ETHE.quote.latestUpdate
                latestPrice = response.data.ETHE.quote.latestPrice
                latestVolume = response.data.ETHE.quote.latestVolume
                lastTradeTime = response.data.ETHE.quote.lastTradeTime
                avgTotalVolume = response.data.ETHE.quote.avgTotalVolume
                marketCap = response.data.ETHE.quote.marketCap
                calculationPrice = response.data.ETHE.quote.calculationPrice

                const point2 = new Point('ethe')
                    .tag('symbol', 'ethe')
                    .tag('calculationPrice', calculationPrice)
                    .floatField('open', open)
                    .floatField('close', close)
                    .intField('closeTime', closeTime)
                    .floatField('latestPrice', latestPrice)
                    .intField('latestVolume', latestVolume)
                    .intField('latestUpdate', latestUpdate)
                    .intField('lastTradeTime', lastTradeTime)
                    .intField('avgTotalVolume', avgTotalVolume)
                    .floatField('marketCap', marketCap)
                writeApi.writePoint(point2)

                console.log("Wrote ethe: price " + latestPrice + ", volume" 
                + latestVolume + ", time " + latestUpdate)

                writeApi.close()

            }
        })
}, 30000)

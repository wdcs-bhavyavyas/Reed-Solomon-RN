import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  Button,
} from 'react-native';
import * as reedSolomonErasureCore from './reedSolomonErasureCore.js';
import ReedSolomonErasure from './reedSolomonErasure.js';
import RNFS from 'react-native-fs';
import {Words} from './constant.js';









function temp() {
  console.log('PATH', RNFS.DocumentDirectoryPath);
  // const SHARD_SIZE = 6;
  const DATA_SHARDS = 3;
  const PARITY_SHARDS = 3;
  let tempObj = new ReedSolomonErasure(reedSolomonErasureCore);
  var randomWords = [];
  while (randomWords.length <= 12) {
    var r = Math.floor(Math.random() * 2048) + 1;
    if (randomWords.indexOf(r) === -1) randomWords.push(Words[r]);
  }
  var Mnemonic = randomWords.toString().replaceAll(',', ' ');
  console.log('Mnemonic : ', Mnemonic);
  var test = Buffer.from(Mnemonic, 'utf8').toJSON();
  var adjustmentArray = test.data;
  const empty_bytes = adjustmentArray.length % DATA_SHARDS;
  let adjustment_bytes = 0;
  if (empty_bytes > 0) {
    adjustment_bytes = DATA_SHARDS - empty_bytes;
  }
  for (var i = 0; i < adjustment_bytes; i++) {
    adjustmentArray.push(0);
  }
  const SHARD_SIZE = adjustmentArray.length / DATA_SHARDS;
  console.log(
    `Data Shards: ${DATA_SHARDS}, Parity Shards : ${PARITY_SHARDS}, Shard size:${SHARD_SIZE}`,
  );
  console.log(
    '===========================================================================================================',
  );
  const input = new Uint8Array(adjustmentArray);
  //Encode data
  const shards = new Uint8Array(SHARD_SIZE * (DATA_SHARDS + PARITY_SHARDS));
  shards.set(input.slice());
  tempObj.encode(shards, DATA_SHARDS, PARITY_SHARDS);
  console.log('Shards', shards, typeof shards);
  const dataFile = shards.slice();
  const loopVal = Math.ceil(dataFile.length / SHARD_SIZE);

  for (let i = 0; i < loopVal; i++) {
    const chunkStart = i * SHARD_SIZE;
    const chunkEnd = chunkStart + SHARD_SIZE;
    const fileContent = dataFile.slice(chunkStart, chunkEnd);
    console.log('File Content', fileContent);
    var path = RNFS.DownloadDirectoryPath + `/${i}.txt`;
    RNFS.writeFile(path, fileContent.toString(), 'utf8')
      .then(success => {
        console.log('FILE WRITTEN!');
      })
      .catch(err => {
        console.log(err.message);
      });
    console.log(RNFS.DocumentDirectoryPath + `/${i}.txt`);
  }


  return SHARD_SIZE;
}
async function decode(SHARD_SIZE) {
  let tempObj = new ReedSolomonErasure(reedSolomonErasureCore);
  const DATA_SHARDS = 3;
  const PARITY_SHARDS = 3;
  let shardsData = Buffer.alloc(0);
  let isShardAvailable = [];
  let data_store = [];
  let temp_data_store = [];
  let totalShard = [];
  var result;
  let shardSize = SHARD_SIZE;
console.log("SHARD_SIZE",shardSize);
  var received = await getData();
    console.log("recived",received);
  const combinedString = received.join(",");
    const numberStrings = combinedString.split(",");
    const numberArray = numberStrings.map((numberString) =>
      parseInt(numberString)
    );
    console.log("Number", numberArray);
    var u8 = Uint8Array.from(numberArray);
    console.log("Uint Array", u8);
    const result_test = tempObj.reconstruct(u8, 3, 3, [
      true,
      true,
      true,
      true,
      true,
      true,
    ]);
    console.log("RES TEST", result_test);

    if(result_test == 0) {
        console.log(
            "Recovery Done \nRecovered Seed Phase:-",
            Buffer.from(
              u8.slice(0, shardSize * DATA_SHARDS)
            ).toString()
          );
    }
}


const getData = async() => {
    const DATA_SHARDS = 3;
    const PARITY_SHARDS = 3;
    const data = [];
    for (let i = 0; i < DATA_SHARDS + PARITY_SHARDS; i++) {
        var f_data = await RNFS.readFile(RNFS.DownloadDirectoryPath + `/${i}.txt`,"utf8");
        data.push(f_data)
    }
    
    return data;
}


function Test() {
  const [data_shard, setDataShard] = useState('0');
  const [parity_shard, setParityShard] = useState(0);
  const [shardSize, setShardSize] = useState(0);

  useEffect(() => {
    var SHARD_SIZE = temp();
    setShardSize(SHARD_SIZE);
    // decode();
    // ddd();
  }, []);
  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{alignItems: 'center', justifyContent: 'center'}}>
            Team Safeguard!!!
          </Text>
        </View>
        <Button onPress={() => decode(shardSize)} title="Press me to decode" />
      </ScrollView>
    </SafeAreaView>
  );
}
export default Test;

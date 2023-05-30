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

  console.log('Shards', shards, typeof(shards));

  const dataFile = shards.slice();
  const loopVal = Math.ceil(dataFile.length / SHARD_SIZE);

  // var path = RNFS.DocumentDirectoryPath + '/test.txt';

  // write the file
  // RNFS.writeFile(path, 'Lorem ipsum dolor sit amet', 'utf8')
  //   .then((success) => {
  //     console.log('FILE WRITTEN!');
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //   });

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

  // for (let i = 0; i <DATA_SHARDS + PARITY_SHARDS; i++) {
  //     try {

  //     } catch(err) {
  //         console.log(err);
  //     }
  // }
}

function decode(SHARD_SIZE) {
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

  // var hc = Uint8Array.from([
  //   98, 111, 117, 110, 99, 101, 32, 115, 105, 103, 104, 116, 32, 109, 105, 114,
  //   114, 111, 114, 32, 115, 116, 117, 100, 101, 110, 116, 32, 100, 105, 115,
  //   109, 105, 115, 115, 32, 103, 114, 111, 119, 32, 100, 105, 102, 102, 101,
  //   114, 32, 101, 97, 115, 105, 108, 121, 32, 115, 101, 110, 116, 101, 110, 99,
  //   101, 32, 115, 97, 117, 115, 97, 103, 101, 32, 104, 105, 115, 116, 111, 114,
  //   121, 32, 116, 111, 107, 101, 110, 32, 103, 97, 100, 103, 101, 116, 0, 106,
  //   38, 117, 124, 54, 113, 51, 123, 123, 103, 100, 116, 53, 127, 99, 114, 43,
  //   42, 103, 60, 113, 125, 98, 100, 113, 106, 126, 51, 100, 115, 16, 8, 224, 81,
  //   164, 53, 1, 17, 235, 177, 234, 8, 210, 221, 99, 29, 114, 226, 128, 254, 61,
  //   243, 210, 79, 251, 217, 20, 196, 53, 106, 31, 196, 7, 230, 87, 185, 118, 3,
  //   67, 247, 175, 173, 4, 207, 155, 104, 17, 114, 176, 138, 237, 110, 233, 202,
  //   67, 191, 207, 31, 222, 97, 107, 24, 212,
  // ]);

  // const result_test = tempObj.reconstruct(Buffer.from, 3, 3, [
  //   true,
  //   true,
  //   true,
  //   true,
  //   true,
  //   true,
  // ]);

  // console.log('RES TEST', result_test);

  var myPromise = new Promise((myResolve, myReject) => {
    for (let i = 0; i < DATA_SHARDS + PARITY_SHARDS; i++) {
      try {
        let file = RNFS.readFile(
          RNFS.DownloadDirectoryPath + `/${i}.txt`,
          'utf8',
        ).then(data => {
          // shardsData = Buffer.concat([shardsData, Array(data)]);
          data_store.push(data);
          // console.log(typeof(data));
          // var a = Buffer.from(data);
          console.log('Original', data);
          // console.log('Buffer', a.toString());
          console.log('DATA_STORE', data_store);
          // result = ''.concat(data_store).replace('"', '')
          // var qaz = array.map(data => parseInt(data));
          // console.log("qaz", qaz);
          const combinedString = data_store.join(',');
          const numberStrings = combinedString.split(',');
          const numberArray = numberStrings.map(numberString =>
            parseInt(numberString),
          );
          console.log('Number', numberArray);
          var u8 = Uint8Array.from(numberStrings);
          console.log('U8', u8);
          isShardAvailable.push(true);
          console.log('Is available shards', isShardAvailable);
          // var qw = Buffer.from(result);
          // console.log("Qw",qw);
          const result_test = tempObj.reconstruct(u8, 3, 3, [true, true, true, true, true, true]
            );

          console.log('RES TEST', result_test);

          // console.log(Buffer.from(data))
          // console.log('Data', data.toString());
        });
      } catch {
        isShardAvailable.push(false);
        shardsData = Buffer.concat([
          shardsData,
          Buffer.alloc(parseInt(shardSize)),
        ]);
      }
    }
    myResolve(() => {
      console.log('AQWERFCF');
    });
  });

  myPromise.then(result => {
    console.log('AAAAAAAAAAAAAAAAAA', result);
  });

  // var path = RNFS.DownloadDirectoryPath + `/${i}.txt`

  //   console.log('Op', shardsData);
  //   console.log("Shard data", data_store);
  // console.log("Decoding file");
  // console.log(file.toString());
}

function ddd() {
  // console.log('After Demo loop');
  let tempObj = new ReedSolomonErasure(reedSolomonErasureCore);

  let data = Uint8Array.from([
    107, 110, 105, 102, 101, 32, 115, 112, 105, 100, 101, 114, 32, 118, 97, 110,
    105, 115, 104, 32, 105, 110, 105, 116, 105, 97, 108, 32, 115, 119, 97, 108,
    108, 111, 119, 32, 108, 105, 111, 110, 32, 103, 97, 114, 109, 101, 110, 116,
    32, 109, 97, 99, 104, 105, 110, 101, 32, 97, 115, 107, 32, 111, 98, 101,
    121, 32, 99, 111, 112, 112, 101, 114, 32, 114, 117, 108, 101, 32, 99, 111,
    105, 108, 0, 0, 56, 120, 123, 97, 41, 32, 102, 53, 124, 45, 105, 115, 112,
    97, 101, 110, 36, 100, 115, 56, 44, 35, 107, 120, 104, 100, 2, 69, 12, 132,
    117, 24, 174, 221, 53, 180, 33, 137, 33, 220, 221, 234, 121, 198, 226, 197,
    22, 15, 51, 207, 21, 150, 97, 15, 9, 242, 20, 157, 125, 18, 167, 146, 49,
    228, 36, 132, 43, 192, 221, 251, 121, 218, 230, 211, 16, 91, 122, 204, 29,
    129, 96, 7, 11, 183,
  ]);
  console.log(data);
  // // console.log(corruptedShards);
  const result = tempObj.reconstruct(Buffer.from(data), 3, 3, [
    true,
    true,
    true,
    true,
    true,
    true,
  ]);
  console.log(result);
  console.log(data);
}

function Test() {
  const [data_shard, setDataShard] = useState('0');
  const [parity_shard, setParityShard] = useState(0);

  useEffect(() => {
    temp();
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
          {/* <View style={{flexDirection:'row'}}>
                        <Text>DATA SHARD</Text>
                        <TextInput editable
                            multiline
                            numberOfLines={4}
                            maxLength={40}
                            onChangeText={text => setDataShard(text)}
                            value={data_shard}
                            style={{padding: 10}} 
                        />
                    </View> */}
        </View>
        <Button onPress={() => decode(6)} title="Press me to decode" />
      </ScrollView>
    </SafeAreaView>
  );
}

export default Test;

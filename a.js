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
  Button
} from 'react-native';

import * as reedSolomonErasureCore from './reedSolomonErasureCore.js';
import ReedSolomonErasure from './reedSolomonErasure.js';
import RNFS from 'react-native-fs';
import {Words} from './constant.js';

const init = async() => {
    const reedSolomonErasure = await ReedSolomonErasure.fromCurrentDirectory();
    console.log(reedSolomonErasure);
    const SHARD_SIZE = 4;
    const DATA_SHARDS = 4;
    const PARITY_SHARDS = 2;
    const input = Uint8Array.of(
        1, 2, 3, 4,
        1, 2, 3, 4,
        1, 2, 3, 4,
        1, 2, 3, 4,
    );
    
    const shards = new Uint8Array(SHARD_SIZE * (DATA_SHARDS + PARITY_SHARDS));
    shards.set(input.slice());
    
    console.log(
        'Encoding success: expect 0, result',
        reedSolomonErasure.encode(shards, DATA_SHARDS, PARITY_SHARDS),
    );
    
    const corruptedShards = shards.slice();
    corruptedShards.set([0, 0, 0, 0], 0);
    corruptedShards.set([0, 0, 0, 0], SHARD_SIZE);
    
    console.log('Corrupted shards 0 and 1');
    
    const result = reedSolomonErasure.reconstruct(
        corruptedShards,
        DATA_SHARDS,
        PARITY_SHARDS,
        [false, false, true, true, true, true],
    );
    
    console.log(
        'Reconstructing corrupted data shards: expect 0, result',
        result,
    );
    console.log(
        'Original data shards:     ',
        input.join(', '),
    );
    console.log(
        'Reconstructed data shards:',
        corruptedShards.slice(0, SHARD_SIZE * DATA_SHARDS).join(', '),
    );
    
}

const A = () => {

    useEffect(() => {
        init();
    },[])

    return (
        <View style={styles.container}>
        <Text>Team Safeguard!</Text>
        <Text>Gochi</Text>
        <Button title="Encode" onPress={() => {init()}} />
        <Button title="Decode" onPress={() => {}} />
      </View>
    )
} 

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default A;
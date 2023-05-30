import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, Button } from 'react-native';
import ReedSolomonErasure from '@subspace/reed-solomon-erasure.wasm';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [1, 2, 3, 4, 5],
      parity: [],
    };
  }

  async encode() {
    const { data } = this.state;
    const { ReedSolomonErasure } = this.props;
    const reedSolomonErasure = await ReedSolomonErasure.fromCurrentDirectory();

    // const { encode } = ReedSolomonErasure;

    this.setState({
      parity: reedSolomonErasure.encode(data, 2, 3),
    });
  }

  decode() {
    const { data, parity } = this.state;
    const { ReedSolomonErasure } = this.props;
    const { decode } = ReedSolomonErasure;

    const decodedData = decode(data, parity);

    console.log(decodedData);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Data:</Text>
        <Text>{this.state.data.join(', ')}</Text>
        <Text>Parity:</Text>
        <Text>{this.state.parity.join(', ')}</Text>
        <Button title="Encode" onPress={this.encode.bind(this)} />
        <Button title="Decode" onPress={this.decode.bind(this)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
module.exports = {
    dependencies: {
      '@subspace/reed-solomon-erasure.wasm': {
        platforms: {
          android: {
            packageInstance: 'new ReedSolomonErasureWasmPackage()',
          },
          ios: null, // For iOS, you may need additional steps, explained below
        },
      },
    },
  };
  
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Agregar soporte para archivos CSV
config.resolver.assetExts.push("csv");

module.exports = config;

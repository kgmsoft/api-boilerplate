const joi = require('joi');
const { pick, mapKeys, camelCase } = require('lodash');

module.exports = getConfig(process.env);

function getConfig(enviromentVariables) {
    const config = validateEnvVariables(enviromentVariables);
    const camelCasedEnv = convertEnvKeysToCamelCase(config);
    return camelCasedEnv;
}

function validateEnvVariables(enviromentVariables) {
    const configSchemaParams = {
        APP_PORT: joi.number().required(),
        DB_HOST: joi.string().required(),
        DB_NAME: joi.string().required(),
        DB_PORT: joi.number().required(),
        DB_USER: joi.string().required(),
        DB_PASSWORD: joi.string().allow('').required()
    };

    const envVars = pick(enviromentVariables, Object.keys(configSchemaParams));
    const envVarsSchema = joi.object().keys(configSchemaParams).required();

    const { error, value: validatedEnvironmentVariables } = joi.validate(
        envVars,
        envVarsSchema
    );

    if (error) {
        throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedEnvironmentVariables;
}

function convertEnvKeysToCamelCase(object) {
    return mapKeys(object, (_, key) => camelCase(key));
}
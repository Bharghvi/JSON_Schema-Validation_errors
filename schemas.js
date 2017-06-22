let Ajv = require('ajv')
let ajv = new Ajv({ allErrors: true, jsonPointers: true })
require('ajv-errors')(ajv)

const schema = {
    type: 'object',
    properties: {
        userName: {type: "string"},
        userAddress: {
            type: "object",
            properties: {
                roomNo: { type: "number" },
                streetName: { type: "string" },
                city: { type: "string" },
                contact: {
                    type: "array",
                    items: {
                        type: "number"
                    }
                }
            }
        }
    }
}

const validation = (schema, data) => {
    let validate = ajv.compile(schema)
    // let errorContent = {}
    let errorMessage = []
    let errorPath = []
    let errorContent = {
        errorPath,
        errorMessage
    }
    let valid = validate(data)
    if (valid) return errorContent
    else {
        errorPath = validate.errors.map(error => {
            return error.dataPath
        })
        errorMessage = validate.errors.map(error => {
            return error.message
        })
        errorContent = {
            errorPath,
            errorMessage
        }
        return errorContent
    }
}

validation({
    userName: "abc",
    userAddress: {
        roomNo: 123,
        streetName: "MG Road",
        city: "Mumbai",
        contact: [
            9876543212, 9123144314 
        ]
    }
})

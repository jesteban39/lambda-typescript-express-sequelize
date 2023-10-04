import type { ModelAttributeColumnOptions, Model } from 'sequelize'
import db from '@db'

const getTypeOf = (atribute: ModelAttributeColumnOptions<Model<any, any>>): [string, number] => {
    const stringType = atribute.type.toString({})
    const getlength = (stringT: string): number | null => {
        const num = Number(stringT.replace(/[\D]/ig, ''))
        if (Number.isNaN(num)) return null
        return num
    }
    if (stringType === 'TINYINT(1)') return ['boolean', 1]
    if (stringType.includes('VARCHAR')) return ['string', getlength(stringType) || -1]
    if (stringType.includes('CHAR')) return ['string', getlength(stringType) || -1]
    if (stringType.includes('TEXT')) return ['string', 0]
    if (stringType.includes('DATE')) return ['string', 10]
    if (stringType.includes('TIME')) return ['string', 8]
    if (stringType.includes('DATETIME')) return ['string', 25]
    if (stringType.includes('INTEGER')) return ['number', getlength(stringType) || 1]
    if (stringType.includes('NUMBER')) return ['number', getlength(stringType) || 1]
    console.log(atribute.field, stringType)
    return ['', -1]
}

const mekeProperties = (modelName: string) => {
    const Model = db.getModels()[modelName]

    const atributes = Model.getAttributes()

    return Object.keys(atributes).reduce((properties: any, key: string) => {
        const atribute = atributes[key]
        properties[key] = {
            type: getTypeOf(atribute)[0],
            required: atribute.allowNull !== true,
            description: atribute.comment || `${Model.tableName} ${atribute.field?.replace(/_/g, ' ')}`,
            example: '3973'
        }
        return properties
    }, {})

}

export const mekeDefinitions = () => {
    const models = Object.keys(db.getModels())
    return models.reduce((definitions: any, modelName) => {
        definitions[modelName] = {
            type: "object",
            properties: mekeProperties(modelName)
        }
        return definitions
    }, {})
}

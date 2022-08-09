# strapi-plugin-slugify

A plugin for [Strapi](https://github.com/strapi/strapi) that provides the ability to auto slugify a field for any content type. It also provides a findOne by slug endpoint as a utility.

[![Downloads](https://img.shields.io/npm/dm/strapi-plugin-slugify?style=for-the-badge)](https://img.shields.io/npm/dm/strapi-plugin-slugify?style=for-the-badge)
[![Install size](https://img.shields.io/npm/l/strapi-plugin-slugify?style=for-the-badge)](https://img.shields.io/npm/l/strapi-plugin-slugify?style=for-the-badge)
[![Package version](https://img.shields.io/github/v/release/ComfortablyCoding/strapi-plugin-slugify?style=for-the-badge)](https://img.shields.io/github/v/release/ComfortablyCoding/strapi-plugin-slugify?style=for-the-badge)

## Requirements

The installation requirements are the same as Strapi itself and can be found in the documentation on the [Quick Start](https://strapi.io/documentation/developer-docs/latest/getting-started/quick-start.html) page in the Prerequisites info card.

### Supported Strapi versions

- v4.x.x

**NOTE**: While this plugin may work with the older Strapi versions, they are not supported, it is always recommended to use the latest version of Strapi.

## Installation

```sh
npm install strapi-plugin-slugify

# or

yarn add strapi-plugin-slugify
```

## Configuration

The plugin configuration is stored in a config file located at `./config/plugins.js`.

> Please note that the field referenced in the configuration file must exist. You can add it using the Strapi Admin UI. Also note that adding a field at a later point in time will require you to unpublish, change, save and republish the entry/entries in order for this plugin to work correctly.

A sample configuration

```javascript
module.exports = ({ env }) => ({
  // ...
  slugify: {
    enabled: true,
    config: {
      contentTypes: {
        article: {
          field: 'slug',
          references: 'title',
        },
      },
    },
  },
  // ...
});
```

This will listen for any record created or updated in the article content type and set a slugified value for the slug field automatically based on the title field.

> Note that if you want to rewrite the same field (so `title` is both a reference and a slug) then you just put `title` for both the `field` and `references` properties.

**IMPORTANT NOTE**: Make sure any sensitive data is stored in env files.

### Additional Requirement for GraphQL

Per [#35](https://github.com/ComfortablyCoding/strapi-plugin-slugify/issues/35) please ensure that the slugify plugin configuration is placed **before** the graphql plugin configuration.

## The Complete Plugin Configuration Object

| Property | Description | Type | Default | Required |
| -------- | ----------- | ---- | ------- | -------- |
| contentTypes | The Content Types to add auto slugification and search findOne by slug search utility to | Object | {} | No |
| contentTypes[modelName] | The model name of the content type (it is the `singularName` in the [model schema](https://docs.strapi.io/developer-docs/latest/development/backend-customization/models.html#model-schema)) | String | N/A | Yes |
| contentTypes[modelName]field | The name of the field to add the slug  | String | N/A | Yes |
| contentTypes[modelName]references | The name(s) of the field(s) used to build the slug. If an array of fields is set it will result in a compound slug | String or Array | N/A | Yes |
| slugifyWithCount | Duplicate strings will have their occurrence appended to the end of the slug | Boolean | false | No |
| shouldUpdateSlug | Allow the slug to be updated after initial generation. | Boolean | false | No |
| skipUndefinedReferences | Skip reference fields that have no data. Mostly applicable to compound slug | Boolean | false | No |
| slugifyOptions | The options to pass the the slugify function. All options can be found in the [slugify docs](https://github.com/sindresorhus/slugify#api) | Object | {} | No |

## Usage

Once the plugin has been installed, configured and enabled the configured content types will have the following additional functionality

### Slugification

Any time the respective content types have an entity created or updated the slug field defined in the settings will be auto generated based on the provided reference field.

### Find One by Slug

Hitting the `/api/slugify/slugs/:modelName/:slug` endpoint for any configured content types will return the entity type that matches the slug in the url. Additionally the endpoint accepts any of the parameters that can be added to the routes built into Strapi.

**IMPORTANT** The modelName is case sensitive and must match exactly with the name defined in the configuration.

#### Additional Requirements

Like all other created API endpoints the `findSlug` route must be allowed under `User & Permissions -> Roles -> Public/Authenticated` for the user to be able to access the route.

## Examples

### Example Request

Making the following request with the sample configuration will look as follows

#### REST

```js
await fetch(`${API_URL}/api/slugify/slugs/article/lorem-ipsum-dolor`);
// GET /api/slugify/slugs/article/lorem-ipsum-dolor
```

#### GraphQL

```graphql
{
  findSlug(modelName:"article",slug:"lorem-ipsum-dolor"){
    ... on ArticleEntityResponse{
      data{
        id
        attributes{
          title
        }
      }
    }
  }
}
```

Additionally  if `draftAndPublish` is enabled for the content-type a `publicationState` arg can be passed to the GraphQL query that accepts either `preview` or `live` as input.

**IMPORTANT** Please beware that the request for an entry in `preview` will return both draft entries & published entries as per Strapi default.

```graphql
{
  findSlug(modelName:"article",slug:"lorem-ipsum-dolor",publicationState:"preview"){
    ... on ArticleEntityResponse{
      data{
        id
        attributes{
          title
        }
      }
    }
  }
}
```

### Example Response

If an article with the slug of `lorem-ipsum-dolor` exists the response will look the same as a single entity response

#### REST

##### Successful Response

```json
{
  "data": {
    "id": 1,
    "attributes":{
      "title": "lorem ipsum dolor",
      "slug": "lorem-ipsum-dolor",
      "createdAt": "2022-02-17T01:49:31.961Z",
      "updatedAt": "2022-02-17T03:47:09.950Z",
      "publishedAt": null
    }
  }
}
```

##### Error Response

To be inline with Strapi's default behavior for single types if an article with the slug of `lorem-ipsum-dolor` does not exist a 404 error will be returned.

```json
{
  "data": null,
  "error": { 
    "status": 404, 
    "name": "NotFoundError", 
    "message": "Not Found", 
    "details": {} 
  }
}
```

#### GraphQL

##### Successful Response

```json
{
  "data": {
    "findSlug": {
      "data": {
        "id": "1",
        "attributes": {
          "title": "lorem ipsum dolor"
        }
      }
    }
  }
}
```

##### Error Response
To be inline with Strapi's default behavior for single types if an article with the slug of `lorem-ipsum-dolor` does not exist the data will be null.

```json
{
  "data": {
    "findSlug": {
      "data": null
    }
  }
}
```

## Bugs

If any bugs are found please report them as a [Github Issue](https://github.com/ComfortablyCoding/strapi-plugin-slugify/issues)

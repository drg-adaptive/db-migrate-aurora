# Welcome to db-migrate-aurora 👋
![stability](https://img.shields.io/badge/stability-alpha-red)
[![npm](https://img.shields.io/npm/v/db-migrate-aurora)](https://www.npmjs.com/package/db-migrate-aurora)
[![Maintainability](https://api.codeclimate.com/v1/badges/eadef0c673311ff3ad10/maintainability)](https://codeclimate.com/github/drg-adaptive/db-migrate-aurora/maintainability)
[![Build Status](https://travis-ci.org/drg-adaptive/db-migrate-aurora.svg?branch=master)](https://travis-ci.org/drg-adaptive/db-migrate-aurora)
[![Dependency Status](https://david-dm.org/drg-adaptive/db-migrate-aurora.svg)](https://david-dm.org/drg-adaptive/db-migrate-aurora)
[![devDependency Status](https://david-dm.org/drg-adaptive/db-migrate-aurora/dev-status.svg)](https://david-dm.org/drg-adaptive/db-migrate-aurora#info=devDependencies)

> A db-migrate driver for aurora serverless.

# AWS Aurora Serverless db-migrate Driver
A db-migrate driver for aurora serverless.

### 🏠 [Homepage](https://github.com/drg-adaptive/db-migrate-aurora)

## Install

```sh
yarn install
```

## Usage

See [db-migrate](https://db-migrate.readthedocs.io/en/latest/) for more information.

### Configuration Example

Add the following configuration to your `database.json` file:

```json
{
  "prod": {
    "driver": {
      "require": "db-migrate-aurora"
    },
    "database": "name of database on server...", // OPTIONAL
    "schema": "name of schema in database...", // OPTIONAL
    "secretArn": "ARN of a secret store containing credentials for the cluster",
    "resourceArn": "ARN of the cluster to connect to",
    "region": "us-east-1", // The AWS region of the cluster
    "maxRetries": 3, // OPTIONAL: number of times to retry connecting
    "connectTimeout": 45000 // OPTIONAL: number of milliseconds to wait until timing out the connection
  }
}
```

## Run tests

```sh
yarn test
```

## Author

👤 **Ben Force <bforce@teamdrg.com>**

* Github: [@drg-adaptive](https://github.com/drg-adaptive)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/drg-adaptive/db-migrate-aurora/issues).

## Show your support

Give a ⭐️ if this project helped you!


## 📝 License

Copyright © 2019 [DRG Adaptive](https://drgadaptive.com/).

This project is [MIT](https://github.com/drg-adaptive/db-migrate-aurora/blob/master/LICENSE) licensed.


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdrg-adaptive%2Fdb-migrate-aurora.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdrg-adaptive%2Fdb-migrate-aurora?ref=badge_large)

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_

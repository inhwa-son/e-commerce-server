
## Step. 1 - Pnpm Install
```bash
$ pnpm install
```
## Step. 2 - DB 
- prisma/migrations/20240626043929_create_table/migration.sql 파일을 실행하여 데이터베이스에 테이블을 생성하셔도됩니다. 
- DB에 데이터가 없다면 data 폴더에 있는 sql 실행하여 데이터를 넣어줍니다.

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

- .insomnia/e-commerce-api-Insomnia.json 파일을 import하여 API 테스트를 진행할 수 있습니다.


### APIs
- [ ] GET /health-check
- [ ] GET Order Sheet API
- [ ] POST Create Order  API
- [ ] POST Create Order Claim(Cancel) API
- [ ] POST Create Order Claim(Return) API




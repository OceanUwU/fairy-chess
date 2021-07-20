# fairy-chess
chess with extra pieces

## setup

1. `npm ci`
1. create `server/cfg.json`, paste the following JSON, and edit it to your needs
    ```json
    {
        "port": 7621,
        "dev": false
    }
    ```
    **options:**
    `port`: the port to run the server from
    `dev`: read on
1. `npx sequelize-cli db:migrate`

### for actual use
4. make sure the `dev` option in `server/cfg.json` is `false`
1. `npm run build`
1. `npm start`


### for development
4. make sure the `dev` option in `server/cfg.json` is `true`
1. `npm run dev-client`
1. in a separate terminal, run `nodemon server`
1. access from http://localhost:7621 (replace 7621 with whatever port your server is running from)
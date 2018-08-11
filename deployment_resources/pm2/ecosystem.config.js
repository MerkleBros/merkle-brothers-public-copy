module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    //Geth
    {
      name: "geth",
      script: './geth.sh',
      "log_date_format" : "YYYY-MM-DD HH:mm Z",
      env_production: {
        "NODE_ENV": "production"
      }
    },

    //Mongodb
    {
      name: 'mongod',
      script: './mongod.sh',
      "log_date_format" : "YYYY-MM-DD HH:mm Z",
      env_production: {
        "NODE_ENV": "production"
      }
    },

    //Main application (merklebros.com)
    {
      name      : 'merkle-brothers',
      script    : '../../bin/www',
      env: {
        "NODE_ENV": "development",
      },
      env_production : {
         "NODE_ENV": "production"
      },
      instances: 1,
      "log_date_format" : "YYYY-MM-DD HH:mm Z"
    },
  ],
};

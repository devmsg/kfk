module.exports = app => {
  const {
    STRING,
    INTEGER,
    DATE
  } = app.Sequelize;
  return app.model.define('user', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: STRING(30),
    phone: STRING(30),
    age: INTEGER,
    created_at: DATE,
    updated_at: DATE,
  }, {
    freezeTableName: false
  });
};
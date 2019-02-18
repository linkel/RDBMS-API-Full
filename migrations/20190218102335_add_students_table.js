
exports.up = function(knex, Promise) {
    return knex.schema.createTable('students', function(tbl) {
    tbl.increments('Id');
    tbl
      .integer('cohort_id')
      .notNullable()
      .references('id')
      .inTable('cohorts');
    tbl.string('name', 255).notNullable();
    tbl.timestamp('createdAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('students');
};

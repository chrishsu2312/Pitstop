class CreatePaths < ActiveRecord::Migration
  def change
    create_table :paths do |t|
      t.string :start_address
      t.string :end_address

      t.timestamps
    end
  end
end

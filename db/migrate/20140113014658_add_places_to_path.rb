class AddPlacesToPath < ActiveRecord::Migration
  def change
    add_column :paths, :place, :text
  end
end

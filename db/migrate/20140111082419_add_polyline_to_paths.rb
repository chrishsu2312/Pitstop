class AddPolylineToPaths < ActiveRecord::Migration
  def change
    add_column :paths, :polyline, :text
  end
end

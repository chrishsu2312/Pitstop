class AddSearchTermToPath < ActiveRecord::Migration
  def change
    add_column :paths, :search_term, :string
  end
end

class Location < ActiveRecord::Base
  has_one :path
  validates :name, uniqueness: true
end

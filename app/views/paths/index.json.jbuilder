json.array!(@paths) do |path|
  json.extract! path, :id, :start_address, :end_address
  json.url path_url(path, format: :json)
end

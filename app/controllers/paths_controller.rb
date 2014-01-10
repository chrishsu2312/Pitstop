include Yelp::V2::Search::Request

class PathsController < ApplicationController
  before_action :set_path, only: [:show, :edit, :update, :destroy]

  # GET /paths
  # GET /paths.json
  def index
    @paths = Path.all
  end

  # GET /paths/1
  # GET /paths/1.json
  def show
    directions = GoogleMapDirections::Directions.new(@path.start_address, @path.end_address)      
    @points = Polylines::Decoder.decode_polyline(directions.polyline) 
    @nearby_places = Hash.new
    if directions.status == 'OK'            
      client = Yelp::Client.new
      index, counter = 0, 0

      while index < @points.length
        requests = GeoPoint.new(
          :term => "resturants",
          :latitude => @points[index][0],
          :longitude => @points[index][1],
          :limit => 3
        )
        yelp_response = client.search(requests)
        if yelp_response != nil and yelp_response["businesses"] != nil
          yelp_response["businesses"].each do |place|            
            place[:coor] = Geocoder.search(place["location"]["display_address"].join(''))
            @nearby_places[place["name"]] = place

          end
        end
        counter = counter + 1
        index = index + Integer((@points.length)/20)
      end      
    end
  end

  # GET /paths/new
  def new
    @path = Path.new
  end

  # GET /paths/1/edit
  def edit
  end

  # POST /paths
  # POST /paths.json
  def create
    @path = Path.new(path_params)


    respond_to do |format|
      if @path.save

        format.html { redirect_to @path, notice: 'Path was successfully created.'}
        format.json { render action: 'show', status: :created, location: @path }
      else
        format.html { render action: 'new' }
        format.json { render json: @path.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /paths/1
  # PATCH/PUT /paths/1.json
  def update
    respond_to do |format|
      if @path.update(path_params)
        format.html { redirect_to @path, notice: 'Path was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @path.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /paths/1
  # DELETE /paths/1.json
  def destroy
    @path.destroy
    respond_to do |format|
      format.html { redirect_to paths_url }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_path
    @path = Path.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def path_params
    params.require(:path).permit(:start_address, :end_address)
  end
end

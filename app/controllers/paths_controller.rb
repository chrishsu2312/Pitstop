include Yelp::V2::Search::Request
include Yelp::V2::Business::Request

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
  end

  # GET /paths/new
  def new
    @path = Path.new
  end

  # GET /paths/1/edit
  def edit
  end
  
  # Get /paths/1/in-and-out
  def place
    @path = Path.find(params[:id])
    client = Yelp::Client.new
    requests = Id.new(:yelp_business_id => params[:place])
    
    @place = client.search(requests)
    @start_to_place = GoogleMapDirections::Directions.new(@path.start_address, @place["location"]["display_address"][0])    
    @place_to_end = GoogleMapDirections::Directions.new(@place["location"]["display_address"][0], @path.end_address)    

  end

  # POST /paths
  # POST /paths.json
  def create
    directions = GoogleMapDirections::Directions.new(path_params["start_address"], path_params["end_address"])    
    @path = Path.new({"start_address"=>path_params["start_address"], "end_address"=>path_params["end_address"], "polyline"=>directions.polyline})    

    if directions.status != 'OK'
      redirect_to new_path_path(@photo), alert: "Bad addresses, please try again"
    else
      if @path.save
        get_yelp_response(@path.id, directions)
        redirect_to @path
      else
        redirect_to new_path_path(@photo), alert: "You had a save error, please try again."
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
    params.require(:path).permit(:start_address, :end_address, :polyline)
  end

  def get_yelp_response(path_id, directions)
    @path = Path.find(path_id)
    @path.place = ""
    points = Polylines::Decoder.decode_polyline(@path.polyline)
    client = Yelp::Client.new
    redundants = Set.new
    (0..points.length-1).step(Integer(points.length/10)).map{|i| points[i]}.each do |x|  
      requests = GeoPoint.new(
        :term => "resturants",
        :latitude => x[0],
        :longitude => x[1],
        :limit => 4,
        :radius_filter => [[directions.distance_in_meters, 500].max, 40000].min
      )
      yelp_response = client.search(requests)      
      if yelp_response != nil and yelp_response["businesses"] != nil
        yelp_response["businesses"].each do |place|   
          if !redundants.member?(place["id"])
            @path.place << "*" + place["id"] + "|" + place["name"] + "$" + place["location"]["display_address"].join(' ') + "^"
            redundants.add(place["id"])
          end
        end
      end
    end
    @path.save
  end
end

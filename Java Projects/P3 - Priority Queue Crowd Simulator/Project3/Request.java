
public abstract class Request {

	private String description;
	private int priority;
	private int difficulty;
	private int factor;
	private int startTime;
	private int endTime;
	private int completionLevel;
	private Status status;
	
	public int calculateProcessingTime()
	{
		return difficulty * factor;
	}
	
	//setters
	public void setDescription(String description){
		this.description = description;
	}
	
	public void setPriority(int priority){
		this.priority = priority;
	}
	
	public void setDifficulty(int difficulty){
		this.difficulty = difficulty;
	}
	
	public void setFactor(int factor){
		this.factor = factor;
	}
	
	public void settartTime(int startTime){
		this.startTime = startTime;
	}
	
	public void setEndTime(int endTime){
		this.endTime = endTime;
	}
	
	
	public void setCompletionLevel(int completionLevel){
		this.completionLevel = completionLevel;
	}
	
	
	public void setStatus(Status status){
		this.status = status;
	}
	
	//getters
	public String getDescription(){
		return description;
	}
	
	public int getPriority(){
		return priority;
	}
	
	public int getDifficulty(){
		return difficulty;
	}
	
	public int getFactor(){
		return factor;
	}
	
	public int getStartTime(){
		return startTime;
	}
	
	public int getEndTime(){
		return endTime;
	}
	
	public int getCompletionLevel(){
		return completionLevel;
	}
	
	public Status getStatus(){
		return status;
	}
}

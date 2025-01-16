
public class InformationRequest extends Request {
	
	private String[] questions;
	
	public InformationRequest (String description, int priority, int difficulty, String[] questions)
	{
		super();
		setDescription(description);
		setPriority(priority);
		setDifficulty(difficulty);
		
		this.questions = questions;
		
		setFactor(1);
		setStatus(Status.NEW);
		
	}
	
	public int calculateProcessingTime()
	{
		return getDifficulty() * getFactor() * questions.length;
	}

	
	
	public void setQuestions(String[] questions){
		this.questions = questions;
	}
	
	public String[] getQuestions(){
		return questions;
	}
}

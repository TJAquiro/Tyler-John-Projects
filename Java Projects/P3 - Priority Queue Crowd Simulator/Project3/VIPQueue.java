
public class VIPQueue extends Queue{
	
	private boolean acceptingAnyClients;
	
	public VIPQueue (String serverName, int queueSize, boolean acceptingAnyClients)
	{
		super(serverName, queueSize);
		this.acceptingAnyClients  = acceptingAnyClients ;
		
	}
	 
	 public VIPQueue (String serverName, int queueSize)
	{
		super(serverName, queueSize);
	}
	 
	public boolean getAcceptingAnyClients()
	{
		return acceptingAnyClients;
	}
	
	public void getAcceptingAnyClients(boolean acceptingAnyClients)
	{
		this.acceptingAnyClients = acceptingAnyClients;
	}

}

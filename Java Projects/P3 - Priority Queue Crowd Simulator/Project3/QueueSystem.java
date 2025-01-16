
public class QueueSystem {
	private static int clock;
	private static int totalWaitingTime;
	private static Client[] clientsWorld;
	private static int totalClientsInSystem;
	private static int waitingLineSize;
	private static Client[] waitingLine;
	private static boolean tvInWaitingArea;
	private static boolean coffeeInWaitingArea;
	private static Queue[] queues;
	private boolean noVIPInSystem = true;
	
	public QueueSystem (int waitingLineSize, boolean tvInWaitingArea,boolean coffeeInWaitingArea)
	{
		QueueSystem.waitingLineSize = waitingLineSize;
		QueueSystem.tvInWaitingArea = tvInWaitingArea;
		QueueSystem.coffeeInWaitingArea = coffeeInWaitingArea;
		QueueSystem.clock = 0;
		QueueSystem.waitingLine = new Client[waitingLineSize];
	}
	
	public void increaseTime()
	{
		//checks if there is a VIP present
		for(int x = 0;x < clientsWorld.length; ++x)
		{
			if(clientsWorld[x] instanceof VIPClient)
			{
				noVIPInSystem = false;
			}
		}
		
		++clock;
		
		//adds 1 to waiting time for each client in waiting line
		for(int x = 0;x < waitingLine.length; ++x)
		{
			if (waitingLine[x] != null)
			{
				(waitingLine[x]).setWaitingTime((waitingLine[x]).getWaitingTime() + 1);
			}
		}
		
		//adds 1 to TimeInQueue for each clients in queue
		for(int y = 0;y < queues.length; ++y)
		{
			for(int x = 0;x < queues[y].getClientsInQueue().length; ++x)
			{
				if (queues[y] != null && queues[y].getClientsInQueue() != null && queues[y].getClientsInQueue()[x] != null)
				{
					(queues[y].getClientsInQueue())[x].setTimeInQueue((queues[y].getClientsInQueue())[x].getTimeInQueue() + 1);
				}
			}
		}
		
		//adds 1 to ServiceTime for each client currently being served
		for(int z = 0;z < queues.length; ++z)
		{
			if (queues[z] != null && queues[z].getClientBeingServed() != null)
			{
				(queues[z].getClientBeingServed()).setServiceTime((queues[z].getClientBeingServed()).getServiceTime() + 1);
			}
		}
		
		//subtracts 1 from Patience for each client in waitingLine
		for(int i = 0;i < waitingLine.length; ++i)
		{
			if (waitingLine[i] != null)
			{
				(waitingLine[i]).setPatience((waitingLine[i]).getPatience() - 1);
			}
		}
		
		//subtracts 1 from Patience for each client in queue
		for(int i = 0;i < queues.length; ++i)
		{
			for(int x = 0;x < queues[i].getClientsInQueue().length; ++x)
			{
				if (queues[i] != null && (queues[i].getClientsInQueue()[x]) != null)
				{
					((queues[i].getClientsInQueue()[x])).setPatience((queues[i].getClientsInQueue()[x]).getPatience() - 1);
				}
			}
		}
		
		//Client is removed if Patience is -1 from waiting line
		for(int j = 0;j < waitingLine.length; ++j)
		{
			if (waitingLine[j] != null)
			{
				if (waitingLine[j].getPatience() < 0 && waitingLine[j] != null)
				{
					waitingLine[j].setDepartureTime(clock);
					
					Client[] replaceWaitingLine = new Client[waitingLine.length];
					int inc = 0;
							
					for(int x = 0;x < waitingLine.length; ++x)
					{
						if(x == j)
						{
							++x;
						}
						else
						{
							replaceWaitingLine[inc] = waitingLine[x];
							++inc;
						}
					}
					waitingLine = replaceWaitingLine;
				}
			}
		}
		
		//Client is removed if Patience is -1 from queueLine
		for(int j = 0;j < queues.length; ++j)
		{
			for(int x = 0;x < queues[j].getClientsInQueue().length; ++x)
			{
				if (queues[j] != null && (queues[j].getClientsInQueue()[x]) != null)
				{
					if ((queues[j].getClientsInQueue()[x]).getPatience() < 0 && queues[j] != null)
					{
						queues[j].getClientsInQueue()[x].setDepartureTime(clock);
						
						Client[] queueLine = new Client[queues[j].getClientsInQueue().length];
						int inc = 0;
								
						for(int x1 = 0;x1 < queues[j].getClientsInQueue().length; ++x1)
						{
							if(x1 == j)
							{
								++x1;
							}
							else
							{
								queueLine[inc] = queues[j].getClientsInQueue()[x1];
								++inc;
							}
						}
						queues[j].setClientsInQueue(queueLine);
					}
				}
			}
		}
		
		//checks if server is done with requests, removes them, adds them to history
		for(int x = 0;x < queues.length; ++x)
		{
			if (queues[x] != null && queues[x].getClientBeingServed() != null)
			{
				if (queues[x].getClientBeingServed().getServiceTime() >= queues[x].getClientBeingServed().getProcessingTime())
				{
					//if processing has finished for a client this part adds this client to the queue's ClientsHistory
					
					//sets who the client was served by
					queues[x].getClientBeingServed().setServedBy(queues[x].getServerName());
					//sets who the client was served by
					queues[x].getClientBeingServed().setDepartureTime(clock);
					
					//sets all requests to done
					Request[] replRequest = queues[x].getClientBeingServed().getRequests();
					
					for(int i = 0;i < queues[x].getClientBeingServed().getRequests().length; ++i)
					{
						replRequest[i].setStatus(Status.PROCESSED);
					}
					queues[x].getClientBeingServed().setRequests(replRequest);
					
					Client[] replaceArr = new Client[queues[x].getClientsHistory().length + 1];
					
					for(int y = 0;y < queues[x].getClientsHistory().length; ++y)
					{
						replaceArr[y] = queues[x].getClientsHistory()[y];
					}
					replaceArr[queues[x].getClientsHistory().length] = queues[x].getClientBeingServed();
					
					queues[x].setClientsHistory(replaceArr);
					
					//client is then removed from queue
					queues[x].setClientBeingServed(null);
					
				}
			}
		}
		
		//adds clients that have arrived at the same time are added to tempArray
		
		Client[] tempArray = new Client[clientsWorld.length];
		int indexer = 0;
		
		for(int x = 0;x < clientsWorld.length; ++x)
		{	
			if (clientsWorld[x] != null)
			{
				if (clientsWorld[x].getArrivalTime() == clock)
				{
					tempArray[indexer] = clientsWorld[x];
					
					clientsWorld[x] = null;
					
					++indexer;
				}
			}
		}
		
		//additional patience is added if there is coffee/TV
		for(int x = 0;x < tempArray.length; ++x)
		{
			if (tempArray[x] != null)
			{
				if(coffeeInWaitingArea == true)
				{
					tempArray[x].setPatience(tempArray[x].getPatience() + 15);
				}
				if(tvInWaitingArea == true)
				{
					tempArray[x].setPatience(tempArray[x].getPatience() + 20);
				}
			}
		}
		indexer = 0;
		
		//takes clients in tempArray and sorts them using FIFO
		Client[] fifoSortedArray = {tempArray[0]};
		Client[] tempReplacerArray;
		
		for(int x = 1;x < tempArray.length; ++x)
		{
			tempReplacerArray = new Client[fifoSortedArray.length + 1];
	        
			Client Clienttoadd = tempArray[x];
	        
	        for(int x1 = 0;x1 < fifoSortedArray.length; ++x1)
	        {
	        	//uses getYearOfBirth to get a person's place in fifoSortedArray
	        	if(Clienttoadd != null)
	        	{
		            if (Clienttoadd.getYearOfBirth() < fifoSortedArray[x1].getYearOfBirth())
		            {
		            	tempReplacerArray[x1] = Clienttoadd;
		                    
		                for(int z1 = 0;z1 < x1; ++z1)
		                {
		                	tempReplacerArray[z1] = fifoSortedArray[z1];
		                }
		                
		                for(int y1 = x1;y1 < fifoSortedArray.length; ++y1)
		                {
		                	tempReplacerArray[y1 + 1] = fifoSortedArray[y1];
		                }
		                
		                break;
		            }
	            
		            //if getYearOfBirth is the same, uses getProcessingTime to get a person's place in fifoSortedArray
		            
		            if ((Clienttoadd.getYearOfBirth() == fifoSortedArray[x1].getYearOfBirth()) && (Clienttoadd.getProcessingTime() < fifoSortedArray[x1].getProcessingTime()))
		            {
		            	tempReplacerArray[x1] = Clienttoadd;
		                    
		                for(int z1 = 0;z1 < x1; ++z1)
		                {
		                	tempReplacerArray[z1] = fifoSortedArray[z1];
		                }
		                
		                for(int y1 = x1;y1 < fifoSortedArray.length; ++y1)
		                {
		                	tempReplacerArray[y1 + 1] = fifoSortedArray[y1];
		                }
		                
		                break;
		            }
		            
		            //if getYearOfBirth and getProcessingTime is the same, uses getLastName to get a person's place in fifoSortedArray
		            
		            if ((Clienttoadd.getYearOfBirth() == fifoSortedArray[x1].getYearOfBirth()) && (Clienttoadd.getProcessingTime() == fifoSortedArray[x1].getProcessingTime()) && (((Clienttoadd.getLastName()).compareToIgnoreCase(fifoSortedArray[x1].getLastName()) < 0)))					
		            {	
		            	tempReplacerArray[x1] = Clienttoadd;
	                    
		                for(int z1 = 0;z1 < x1; ++z1)
		                {
		                	tempReplacerArray[z1] = fifoSortedArray[z1];
		                }
		                
		                for(int y1 = x1;y1 < fifoSortedArray.length; ++y1)
		                {
		                	tempReplacerArray[y1 + 1] = fifoSortedArray[y1];
		                }
		                
		                break;
		            }
		            
		            //if getYearOfBirth, getProcessingTime, getLastName is the same, uses getfirstName to get a person's place in fifoSortedArray
		            
		            if ((Clienttoadd.getYearOfBirth() == fifoSortedArray[x1].getYearOfBirth()) && (Clienttoadd.getProcessingTime() == fifoSortedArray[x1].getProcessingTime()) && (((Clienttoadd.getLastName()).compareToIgnoreCase(fifoSortedArray[x1].getLastName()) == 0)) && (((Clienttoadd.getFirstName()).compareToIgnoreCase(fifoSortedArray[x1].getFirstName()) < 0)))					
		            {	
		            	tempReplacerArray[x1] = Clienttoadd;
	                    
		                for(int z1 = 0;z1 < x1; ++z1)
		                {
		                	tempReplacerArray[z1] = fifoSortedArray[z1];
		                }
		                
		                for(int y1 = x1;y1 < fifoSortedArray.length; ++y1)
		                {
		                	tempReplacerArray[y1 + 1] = fifoSortedArray[y1];
		                }
		                
		                break;
		            }
		            
		          //if getYearOfBirth, getProcessingTime, getLastName, getfirstName is the same, uses getId to get a person's place in fifoSortedArray
		            
		            if ((Clienttoadd.getYearOfBirth() == fifoSortedArray[x1].getYearOfBirth()) && (Clienttoadd.getProcessingTime() == fifoSortedArray[x1].getProcessingTime()) && (((Clienttoadd.getLastName()).compareToIgnoreCase(fifoSortedArray[x1].getLastName()) == 0)) && (((Clienttoadd.getFirstName()).compareToIgnoreCase(fifoSortedArray[x1].getFirstName()) == 0) && Clienttoadd.getId() < fifoSortedArray[x1].getId()))					
		            {	
		            	tempReplacerArray[x1] = Clienttoadd;
	                    
		                for(int z1 = 0;z1 < x1; ++z1)
		                {
		                	tempReplacerArray[z1] = fifoSortedArray[z1];
		                }
		                
		                for(int y1 = x1;y1 < fifoSortedArray.length; ++y1)
		                {
		                	tempReplacerArray[y1 + 1] = fifoSortedArray[y1];
		                }
		                
		                break;
		            }
	        	}
	            //if a client has no priority over others they are put in the last place of the array
	            
	            if (x1 == fifoSortedArray.length - 1)
	            {
	            	tempReplacerArray[fifoSortedArray.length] = Clienttoadd;
	                
	                for(int i = 0;i < fifoSortedArray.length; ++i)
	                {
	                	tempReplacerArray[i] = fifoSortedArray[i];
	                }
	            }
	        }
	        
	        fifoSortedArray = tempReplacerArray;
		}
		
		
		//moves server queues up one if there's space (no client currently being served)
		for(int x = 0;x < queues.length; ++x)
		{
			//to prevent clients who left due to running out of patience from creating gaps in the queue this code compresses them
			int indexer1 = 0;
			Client[] replaceArrayClients = new Client[queues[x].getQueueSize()];
			for(int y = 0;y < queues[x].getClientsInQueue().length; ++y)
			{
				if (queues[x].getClientsInQueue()[y] != null)
				{
					replaceArrayClients[indexer1] = queues[x].getClientsInQueue()[y];
					
					++indexer1;
				}
			}
			queues[x].setClientsInQueue(replaceArrayClients);
			
			//moves the next person in Queue to server if there's space
			
			if (queues[x].getClientBeingServed() == null && (queues[x].getClientsInQueue())[0] != null)
			{
				queues[x].setClientBeingServed((queues[x].getClientsInQueue())[0]);
				
				Client[] replacerArray3 = new Client[queues[x].getQueueSize()];
				
				Request[] replRequest = (queues[x].getClientsInQueue())[0].getRequests();
				
				for(int i = 0;i < (queues[x].getClientsInQueue())[0].getRequests().length; ++i)
				{
					replRequest[i].setStatus(Status.IN_PROGRESS);
				}
				(queues[x].getClientsInQueue())[0].setRequests(replRequest);
				
				for(int x1 = 1;x1 < queues[x].getQueueSize(); ++x1)
				{
					replacerArray3[x1 - 1] = queues[x].getClientsInQueue()[x1];
				}
				
				queues[x].setClientsInQueue(replacerArray3);
			}
		}
		
		//moves waitingLine up one if there's space in server queues
		for(int x = 0;x < waitingLine.length; ++x)
		{
			//add a value of waitingLine to first open queue with no clients currently being served
			for(int y = 0;y < queues.length; ++y)
			{
				if (queues[y].getClientBeingServed() == null)
				{
					if(queues[y] instanceof VIPQueue && ((VIPQueue)queues[y]).getAcceptingAnyClients() == true)
					{
						queues[y].setClientBeingServed(waitingLine[x]);
						
						Request[] replRequest = (waitingLine[x].getRequests());
						
						for(int i = 0;i < (waitingLine[x].getRequests()).length; ++i)
						{
							replRequest[i].setStatus(Status.IN_PROGRESS);
						}
						waitingLine[x].setRequests(replRequest);
						
						
						waitingLine[x] = null;
					}
					else if(queues[y] instanceof VIPQueue && fifoSortedArray[x] instanceof Client && noVIPInSystem)
					{
						queues[y].setClientBeingServed(waitingLine[x]);
						
						waitingLine[x] = null;
					}
					else if(queues[y] instanceof Queue && !(queues[y] instanceof VIPQueue) && fifoSortedArray[x] instanceof Client)
					{
						queues[y].setClientBeingServed(waitingLine[x]);
						
						waitingLine[x] = null;
					}
					else if(queues[y] instanceof VIPQueue && fifoSortedArray[x] instanceof VIPClient)
					{
						queues[y].setClientBeingServed(waitingLine[x]);
						
						waitingLine[x] = null;
					}
				}
			}
			
			//add the a value of waitingLine to first open server queue line
			
			//first figures out which queue has the shortest line
			int counter = 0;
			int CurrentleastPeople = 1000;
			int lineWithLeastPeopleIndex = 0;
			
			for(int y = 0;y < queues.length; ++y)
			{
				if(!(queues[y] instanceof VIPQueue) || ((VIPQueue)queues[y]).getAcceptingAnyClients())
				{
					for(int z = 0;z < queues[y].getClientsInQueue().length; ++z)
					{
						if (queues[y].getClientsInQueue()[z] != null)
						{
							++counter;
						}
					}
					if (counter < CurrentleastPeople)
					{
						CurrentleastPeople = counter;
						
						lineWithLeastPeopleIndex = y;
					}
					
					counter = 0;
				}
			}
			
			//then adds person to the queue with the shortest line
			for(int z = 0;z < queues[lineWithLeastPeopleIndex].getClientsInQueue().length; ++z)
			{
				if(!(queues[lineWithLeastPeopleIndex] instanceof VIPQueue) || ((VIPQueue)queues[lineWithLeastPeopleIndex]).getAcceptingAnyClients())
				{
					if(queues[lineWithLeastPeopleIndex].getClientsInQueue()[z] == null)
					{
						Client[] reArray = queues[lineWithLeastPeopleIndex].getClientsInQueue();
								
						reArray[z] = waitingLine[x];
						
						waitingLine[x] = null;
						
						break;
					}
				}
			}
		}
		
		//to prevent clients who left waitingLine due to running out of patience/moving to queues from creating gaps in the queue this code compresses them
		int indexer2 = 0;
		Client[] waitingLineRepl = new Client[waitingLineSize];
		for(int y = 0;y < waitingLine.length; ++y)
		{
			if (waitingLine[y] != null)
			{
				waitingLineRepl[indexer2] = waitingLine[y];
				
				++indexer2;
			}
		}
		waitingLine = waitingLineRepl;
		
		//Adds fifoSortedArray to queues 
		for(int x = 0;x < fifoSortedArray.length; ++x)
		{
			//add a value of fifoSortedArray to first open queue with no clients currently being served
			for(int y = 0;y < queues.length; ++y)
			{
				if (queues[y].getClientBeingServed() == null)
				{	
					//ensures non VIP clients enter VIP queues unless there is noVIPInSystem or VIPQueue is allowing all guests
					
					if(queues[y] instanceof VIPQueue && ((VIPQueue)queues[y]).getAcceptingAnyClients() == true)
					{
						queues[y].setClientBeingServed(fifoSortedArray[x]);
						
						fifoSortedArray[x] = null;
					}
					else if(queues[y] instanceof VIPQueue && fifoSortedArray[x] instanceof Client && noVIPInSystem)
					{
						queues[y].setClientBeingServed(fifoSortedArray[x]);
						
						fifoSortedArray[x] = null;
					}
					else if(queues[y] instanceof Queue && !(queues[y] instanceof VIPQueue) && fifoSortedArray[x] instanceof Client)
					{
						queues[y].setClientBeingServed(fifoSortedArray[x]);

						fifoSortedArray[x] = null;
					}
					else if(queues[y] instanceof VIPQueue && fifoSortedArray[x] instanceof VIPClient)
					{
						queues[y].setClientBeingServed(fifoSortedArray[x]);

						fifoSortedArray[x] = null;
					}
				}
			}
			
			//add the a value of fifoSortedArray to first open server queue line
			
			//If the person to be added is a VIP or is a client and there's no VIP's present, this first figures out which queue has the shortest line
			if (fifoSortedArray[x] instanceof VIPClient || noVIPInSystem)
			{
				int counter = 0;
				int CurrentleastPeople = 1000;
				int lineWithLeastPeopleIndex = 0;
				
				for(int y = 0;y < queues.length; ++y)
				{
					for(int x1 = 0;x1 < queues[y].getClientsInQueue().length; ++x1)
					{
						if (queues[y].getClientsInQueue()[x1] != null)
						{
							++counter;
						}
					}
					if (counter < CurrentleastPeople)
					{
						CurrentleastPeople = counter;
						
						lineWithLeastPeopleIndex = y;
					}
					
					counter = 0;
				}
				
				//then adds person to the queue with the shortest line
				for(int z = 0;z < queues[lineWithLeastPeopleIndex].getClientsInQueue().length; ++z)
				{
					if(queues[lineWithLeastPeopleIndex].getClientsInQueue()[z] == null)
					{
						Client[] reArray = queues[lineWithLeastPeopleIndex].getClientsInQueue();
								
						reArray[z] = fifoSortedArray[x];
						
						fifoSortedArray[x] = null;
						
						break;
					}
				}
			}
			else
			{	
				//this will do the same thing but with client restrictions on what queue they may enter
				int counter = 0;
				int CurrentleastPeople = 1000;
				int lineWithLeastPeopleIndex = 0;
				
				for(int y = 0;y < queues.length; ++y)
				{
					if(!(queues[y] instanceof VIPQueue) || ((VIPQueue)queues[y]).getAcceptingAnyClients())
					{	
						for(int x1 = 0;x1 < queues[y].getClientsInQueue().length; ++x1)
						{
							if (queues[y].getClientsInQueue()[x1] != null)
							{
								++counter;
							}
						}
						if (counter < CurrentleastPeople)
						{
							CurrentleastPeople = counter;
							
							lineWithLeastPeopleIndex = y;
						}
						counter = 0;
					}
				}
				
				//then adds person to the queue with the shortest line
				for(int z = 0;z < queues[lineWithLeastPeopleIndex].getClientsInQueue().length; ++z)
				{
					if(!(queues[lineWithLeastPeopleIndex] instanceof VIPQueue) || ((VIPQueue)queues[lineWithLeastPeopleIndex]).getAcceptingAnyClients())
					{
						if(queues[lineWithLeastPeopleIndex].getClientsInQueue()[z] == null)
						{
							Client[] reArray = queues[lineWithLeastPeopleIndex].getClientsInQueue();
									
							reArray[z] = fifoSortedArray[x];
							
							fifoSortedArray[x] = null;
							
							break;
						}
					}
				}
			}
		}
		
		//Rearranges and adds Clients from fifoSortedArray to waiting line in order of id
		
		int keepID = 1110;
		int counter = 0;
		
		for(int x = 0;x < fifoSortedArray.length; ++x)
		{	
			for(int y = 0;y < fifoSortedArray.length; ++y)
			{
				
				if(fifoSortedArray[x] != null && fifoSortedArray[y] != null)
				{
					if(keepID > fifoSortedArray[y].getId())
					{
						keepID = fifoSortedArray[y].getId();
					}
				}
			}
			
			for(int z = 0;z < waitingLine.length; ++z)
			{
				if(waitingLine[z] == null)
				{
					for(int i = 0;i < fifoSortedArray.length; ++i) 
					{
						if (fifoSortedArray[i] != null && fifoSortedArray[i].getId() == keepID)
						{
							waitingLine[z] = fifoSortedArray[i];
							
							fifoSortedArray[i] = null;
							
							for(int j = 0;j < fifoSortedArray.length; ++j)
							{
								if(fifoSortedArray[j] != null)
								{
									keepID = fifoSortedArray[j].getId();
									break;
								}
							}
							break;
						}
					}

				}
			}
		}
		
		//adds the last remaining value to waitingList
		for(int x = 0;x < fifoSortedArray.length; ++x)
		{
			if(fifoSortedArray[x] != null)
			{
				for(int y = 0;y < waitingLine.length; ++y)
				{
					if(waitingLine[y] == null)
					{
						waitingLine[y] = fifoSortedArray[x];
						
						break;
					}	
				}
			}
		}
	}
	
	public void increaseTime(int time)
	{
        for(int x = 0;x < time; ++x)
        {
        	increaseTime();
        }
	}
	
	public Client[] getClientsBeingServed()
	{
		int adder = 0;
		
		for(int x = 0;x < queues.length; ++x)
		{
			if(queues[x].getClientBeingServed() != null)
			{
				++adder;
			}
		}
		
		Client[] ReturnArr = new Client[adder];
		
		int indexer = 0;
		
		for(int y = 0;y < queues.length; ++y)
		{
			if(queues[y].getClientBeingServed() != null)
			{
				ReturnArr[indexer] = queues[y].getClientBeingServed();
			}
		}
		
		return ReturnArr;
	}
	
	public String toString()
	{
		String AdderString = "";
		
		for(int y = 0;y < queues.length; ++y)
		{
			AdderString = AdderString + queues[y].toString(false) + "\n";
		}
		
		int adder = 0;
		String addstring = "";
		
		for(int clientx = 0;clientx < waitingLine.length; ++clientx)
		{
			if (waitingLine[clientx] != null && (waitingLine[clientx]).getRequests() != null)
			{
				for(int requestarrayindex = 0;requestarrayindex < ((waitingLine[clientx]).getRequests()).length; ++requestarrayindex)
				{
					adder = adder + (((waitingLine[clientx]).getRequests())[requestarrayindex]).calculateProcessingTime();
				}
			}
			if (adder == 0)
			{
				addstring = addstring + "[" + "  " + "]";
			}
			else
			{
				//if adder is a 1 digit number and a 0 in front
				
				if (adder < 10)
				{
					addstring = addstring + "[" + "0" + adder + "]";
				}
				else
				{
					addstring = addstring + "[" + adder + "]";
				}
			}
			adder = 0;
		}
		
		return AdderString + "---\n" + "[WaitingLine]-" + addstring;
	}
	
	public String toString(boolean showID)
	{
		if (showID)
		{
			String AdderString = "";
			
			for(int y = 0;y < queues.length; ++y)
			{
				AdderString = AdderString + queues[y].toString(true) + "\n";
			}
			
			String addstring = "";
			
			for(int x = 0;x < waitingLine.length; ++x)
			{
				if (waitingLine[x] != null)
				{
					//if id is a 1 digit number and a 0 in front
					
					if ((waitingLine[x]).getId() < 10)
					{
						addstring = addstring + "[" + "0" + (waitingLine[x]).getId() + "]";
					}
					else
					{
						addstring = addstring + "[" + (waitingLine[x]).getId() + "]";
					}
				}
				else
				{
					addstring = addstring + "[" + "  " + "]";
				}
			}
			
			return AdderString + "---\n" + "[WaitingLine]-" + addstring;
		}
		else
		{
			return toString();
		}
	}
	

	
	
	//setters
	public static void setClock(int clock){
		QueueSystem.clock = clock;
	}
	
	public static void setTotalWaitingTime(int totalWaitingTime){
		QueueSystem.totalWaitingTime = totalWaitingTime;
	}
	
	public static void setClientsWorld(Client[] clientsWorld){
		QueueSystem.clientsWorld = clientsWorld;
	}
	
	public static void setTotalClientsInSystem(int totalClientsInSystem){
		QueueSystem.totalClientsInSystem = totalClientsInSystem;
	}
	
	public static void setWaitingLineSize(int waitingLineSize){
		QueueSystem.waitingLineSize = waitingLineSize;
	}
	
	public static void setWaitingLine(Client[] waitingLine){
		QueueSystem.waitingLine = waitingLine;
	}
	
	public static void setTvInWaitingArea(boolean tvInWaitingArea){
		QueueSystem.tvInWaitingArea = tvInWaitingArea;
	}
	
	public static void setCoffeeInWaitingArea(boolean coffeeInWaitingArea){
		QueueSystem.coffeeInWaitingArea = coffeeInWaitingArea;
	}
	
	public static void setQueues(Queue[] queues){
		QueueSystem.queues = queues;

	}
	
	
	
	//getters
	public static int getClock(){
		return clock;
	}
	
	public static int getTotalWaitingTime(){
		return totalWaitingTime;
	}
	
	public static Client[] getClientsWorld(){
		return clientsWorld;
	}
	
	public static int getTotalClientsInSystem(){
		return totalClientsInSystem;
	}
	
	public static int getWaitingLineSize(){
		return waitingLineSize;
	}
	
	public static Client[] getWaitingLine(){
		return waitingLine;
	}
	
	public static boolean getTvInWaitingArea(){
		return tvInWaitingArea;
	}
	
	public static boolean getCoffeeInWaitingArea(){
		return coffeeInWaitingArea;
	}

	public static Queue[] getQueues(){
		return queues;
	}


}

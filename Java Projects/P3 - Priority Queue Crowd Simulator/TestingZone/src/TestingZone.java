class TestingZone {
    public static void main(String[] args) {
        
        int[] arr = {2,4,6,8,10};
        int[] newarr = new int[arr.length + 1];
        
        int numtoadd = 8;
        
        boolean cond2_addnumHasBetterPriority = true;
        
        for(int x = 0;x < arr.length; ++x)
        {
            if (numtoadd <= arr[x])
            {
                if ((numtoadd == arr[x]) && (cond2_addnumHasBetterPriority != true))
                {
                	System.out.println("hello");
                }
                else
                {
                    newarr[x] = numtoadd;
                    
                    for(int z = 0;z < x; ++z)
                    {
                        newarr[z] = arr[z];
                    }
                    
                    for(int y = x;y < arr.length; ++y)
                    {
                        newarr[y + 1] = arr[y];
                    }
                }
            }
            
            if (x == arr.length - 1)
            {
                newarr[arr.length] = numtoadd;
                
                for(int i = 0;i < arr.length; ++i)
                {
                    newarr[i] = arr[i];
                }
            }
        }
        
        for(int x = 0;x < newarr.length; ++x)
        {
            System.out.print(newarr[x] + "\n");
        }
    }
}
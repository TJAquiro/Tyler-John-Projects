/*
Name: Tyler John Aquiro
G#: G01326064
Homework # 4
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <ctype.h>

struct address_t
{
    int first;
    int second;
    int third;
    int fourth;
    char alias[11];
};

// Global array
struct address_t addresses[100];
int address_count = 0;

// Function prototypes
char *getDateAndTime();
void Read_Data_File();
void Generate_Alias_List(char *file_contents);
void Bubble_sort(char order);
void WriteIntoFile(char *name, char order);

void main()
{
    char name[50];
    char order;

    // Gets name and sorting method from the user
    printf("Enter your name: ");
    fgets(name, sizeof(name), stdin);
    name[strcspn(name, "\n")] = 0;

    printf("Sort in A for ascending or D for descending: ");
    scanf(" %c", &order);
    order = toupper(order);

    Read_Data_File();           // reads file and adds it to the global variable
    Bubble_sort(order);         // sorts structs in the global variable
    WriteIntoFile(name, order); // writes each address into a file
}

char *getDateAndTime()
{
    // gets time from local mechine
    time_t t;
    time(&t);
    return ctime(&t);
}

void Read_Data_File()
{
    // opens the file for reading
    FILE *file = fopen("CS222_Inet.txt", "r");
    char line[1000];

    // goes line by line calling Generate_Alias_List to add to struct global variable
    while (fgets(line, sizeof(line), file) != NULL)
    {
        // Remove newline character
        line[strcspn(line, "\n")] = '\0';

        Generate_Alias_List(line);
    }

    fclose(file);
}

void Generate_Alias_List(char *line)
{
    // ensures there aren't more than the allowed amount of addresses
    if (address_count >= 100)
        return;

    int f, s, t, l;
    char alias[20];

    // takes in a line and breaks it into it's parts to be turned into a struct
    if (sscanf(line, "%d.%d.%d.%d %s", &f, &s, &t, &l, alias) == 5)
    {
        if (f == 0 && s == 0 && t == 0 && l == 0 && strcmp(alias, "NONE") == 0)
            return;

        addresses[address_count].first = f;
        addresses[address_count].second = s;
        addresses[address_count].third = t;
        addresses[address_count].fourth = l;

        // Convert alias to uppercase
        int j = 0;
        while (j < 10 && alias[j])
        {
            addresses[address_count].alias[j] = toupper(alias[j]);
            j++;
        }
        addresses[address_count].alias[j] = '\0';

        address_count++;
    }
}

void Bubble_sort(char order)
{
    // sorts the array by alias using the bubble sort algorithm
    for (int i = 0; i < address_count - 1; i++)
    {
        for (int j = 0; j < address_count - 1 - i; j++)
        {
            int cmp = strcmp(addresses[j].alias, addresses[j + 1].alias);

            // checks the sorting method (ascending or descending) and sorts based on that
            if ((order == 'A' && cmp > 0) || (order == 'D' && cmp < 0))
            {
                struct address_t temp = addresses[j];
                addresses[j] = addresses[j + 1];
                addresses[j + 1] = temp;
            }
        }
    }
}

void WriteIntoFile(char *name, char order)
{
    FILE *file = fopen("222_Alias_List", "w");

    // header formatting
    fprintf(file, "%s ", name);
    fprintf(file, "%s", getDateAndTime());
    fprintf(file, "CS222 Network Alias Listing\n\n");

    // goes through each address in the global variable and writes it into the file
    for (int i = 0; i < address_count; i++)
    {
        fprintf(file, "%-10s\t%d.%d.%d.%d\n", addresses[i].alias, addresses[i].first, addresses[i].second, addresses[i].third, addresses[i].fourth);
    }

    fclose(file);
}

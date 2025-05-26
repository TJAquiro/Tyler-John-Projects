/*
Name: Tyler John Aquiro
G#: G01326064
Homework # 5
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <time.h>

/**
 * Struct to store an IPv4 addresses
 */
struct address_t
{
    int first;
    int second;
    int third;
    int fourth;
    char alias[11];
    struct address_t *next;
};

// head of linked list
struct address_t *head = NULL;

// Function prototypes
char *getDateAndTime();
void Read_Data_File();
void Generate_Alias_List(char *line);
void addAddress();
void lookupAddress();
void displayList();
void displayListSize();
void displayAliasesForLocation();
void saveToFile();
void menu();

// Helper functions
void toUpperStr(char *str);
int addressExists(int f, int s, int t, int l);
int aliasExists(char *alias);

int main()
{
    Read_Data_File();
    menu();
    return 0;
}

/**
 * Returns current date and time as a string.
 */
char *getDateAndTime()
{
    time_t t;
    time(&t);
    return ctime(&t);
}

/**
 * Reads address and aliases from the input file and adds them to the linked list.
 */
void Read_Data_File()
{
    FILE *file = fopen("CS222_Inet.txt", "r");
    char line[1000];

    // Checks if file opened successfully, else send an error
    if (!file)
    {
        printf("Error: Could not open file.\n");
        exit(1);
    }

    // reads each line and adds it to the linked list
    while (fgets(line, sizeof(line), file) != NULL)
    {
        line[strcspn(line, "\n")] = '\0';
        Generate_Alias_List(line);
    }

    fclose(file);
}

/**
 * Parses a line into an address and alias and adds it to the linked list.
 */
void Generate_Alias_List(char *line)
{
    int f, s, t, l;
    char alias[20];

    // Parse line into 4 nums and an alias
    if (sscanf(line, "%d.%d.%d.%d %s", &f, &s, &t, &l, alias) == 5)
    {
        // check for sentinel value
        if (f == 0 && s == 0 && t == 0 && l == 0 && strcmp(alias, "NONE") == 0)
            return;

        // Creates a new node
        struct address_t *newNode = malloc(sizeof(struct address_t));
        newNode->first = f;
        newNode->second = s;
        newNode->third = t;
        newNode->fourth = l;

        // Store alias in uppercase
        int j = 0;
        while (j < 10 && alias[j])
        {
            newNode->alias[j] = toupper(alias[j]);
            j++;
        }
        newNode->alias[j] = '\0';

        // Insert node at the head of the list
        newNode->next = head;
        head = newNode;
    }
}

/**
 * Displays the menu and handles user user input.
 */
void menu()
{
    int choice;
    do
    {
        // Print menu options
        printf("\n1) Add address\n2) Look up address\n3) Display list\n4) Display list size\n5) Display aliases for location\n6) Save to file\n7) Quit\n");
        printf("Enter menu option (1-7): ");
        scanf("%d", &choice);
        getchar(); // remove leftover newline

        // Handles user's menu selection
        switch (choice)
        {
        case 1:
            addAddress();
            break;
        case 2:
            lookupAddress();
            break;
        case 3:
            displayList();
            break;
        case 4:
            displayListSize();
            break;
        case 5:
            displayAliasesForLocation();
            break;
        case 6:
            saveToFile();
            break;
        case 7:
            printf("Goodbye!\n");
            break;
        default:
            printf("Invalid option. Try again.\n");
        }
    } while (choice != 7);
}

/**
 * Adds a new address and alias to the list after validating input.
 */
void addAddress()
{
    int f, s, t, l;
    char alias[50];

    // checks if address input is done right, else throw an error
    while (1)
    {
        printf("Enter address: ");
        scanf("%d.%d.%d.%d", &f, &s, &t, &l);
        getchar();

        // if any of the digits aren't in the right range
        if (f < 0 || f > 255 || s < 0 || s > 255 || t < 0 || t > 255 || l < 0 || l > 255)
        {
            printf("Error: Illegal address. Please reenter.\n");
            continue;
        }
        // if the address Exists already
        if (addressExists(f, s, t, l))
        {
            printf("Error: Address already exists. Please reenter.\n");
            continue;
        }
        break;
    }

    // Validate alias input
    while (1)
    {
        printf("Enter alias (10 characters or less): ");
        fgets(alias, sizeof(alias), stdin);
        alias[strcspn(alias, "\n")] = '\0';

        // if the name is too long
        if (strlen(alias) > 10)
        {
            printf("Error: Illegal alias. Please reenter.\n");
            continue;
        }
        toUpperStr(alias);

        // if the alias exists already
        if (aliasExists(alias))
        {
            printf("Error: Alias already exists. Please reenter.\n");
            continue;
        }
        break;
    }

    // Create new node
    struct address_t *newNode = malloc(sizeof(struct address_t));
    newNode->first = f;
    newNode->second = s;
    newNode->third = t;
    newNode->fourth = l;
    strncpy(newNode->alias, alias, 10);
    newNode->alias[10] = '\0';

    // Insert node at head
    newNode->next = head;
    head = newNode;
}

/**
 * Looks up and displays the address for a given alias.
 */
void lookupAddress()
{
    char alias[50];
    printf("Enter alias: ");
    fgets(alias, sizeof(alias), stdin);
    alias[strcspn(alias, "\n")] = '\0';
    toUpperStr(alias);

    // Search list for matching alias
    struct address_t *curr = head;
    while (curr)
    {
        if (strcmp(curr->alias, alias) == 0)
        {
            printf("%s: %d.%d.%d.%d\n", curr->alias, curr->first, curr->second, curr->third, curr->fourth);
            return;
        }
        curr = curr->next;
    }
    printf("Alias %s was not found\n", alias);
}

/**
 * Displays all addresses and aliases in the list.
 */
void displayList()
{
    if (!head)
    {
        printf("List is empty.\n");
        return;
    }

    // print each node
    struct address_t *curr = head;
    while (curr)
    {
        printf("%d.%d.%d.%d\t%s\n", curr->first, curr->second, curr->third, curr->fourth, curr->alias);
        curr = curr->next;
    }
}

/**
 * Displays the number of nodes in the list.
 */
void displayListSize()
{
    int count = 0;
    struct address_t *curr = head;

    // count nodes in linked list
    while (curr)
    {
        count++;
        curr = curr->next;
    }
    printf("List size: %d nodes\n", count);
}

/**
 * Displays all aliases associated with a given location.
 */
void displayAliasesForLocation()
{
    int f, s;
    printf("Enter locality (first two octets): ");
    scanf("%d.%d", &f, &s);
    getchar();

    if (f < 0 || f > 255 || s < 0 || s > 255)
    {
        printf("Error: Illegal location.\n");
        return;
    }

    int found = 0;
    struct address_t *curr = head;

    while (curr)
    {
        if (curr->first == f && curr->second == s)
        {
            printf("%s\n", curr->alias);
            found = 1;
        }
        curr = curr->next;
    }
    if (!found)
    {
        printf("No aliases found for location.\n");
    }
}

/**
 * Saves the current list to a specified file.
 */
void saveToFile()
{
    char filename[100];
    printf("Enter file name: ");
    fgets(filename, sizeof(filename), stdin);
    filename[strcspn(filename, "\n")] = '\0';

    FILE *file = fopen(filename, "w");
    if (!file)
    {
        printf("Error: Cannot create file.\n");
        return;
    }

    // Write each node to file
    struct address_t *curr = head;
    while (curr)
    {
        fprintf(file, "%d.%d.%d.%d\t%s\n", curr->first, curr->second, curr->third, curr->fourth, curr->alias);
        curr = curr->next;
    }

    fclose(file);
    printf("%s has been saved.\n", filename);
}

/**
 * Converts a string to uppercase.
 */
void toUpperStr(char *str)
{
    for (int i = 0; str[i]; i++)
    {
        str[i] = toupper(str[i]);
    }
}

/**
 * Checks if an address already exists in the list.
 */
int addressExists(int f, int s, int t, int l)
{
    struct address_t *curr = head;
    while (curr)
    {
        if (curr->first == f && curr->second == s && curr->third == t && curr->fourth == l)
        {
            return 1;
        }
        curr = curr->next;
    }
    return 0;
}

/**
 * Checks if an alias already exists in the list.
 */
int aliasExists(char *alias)
{
    struct address_t *curr = head;
    while (curr)
    {
        if (strcmp(curr->alias, alias) == 0)
        {
            return 1;
        }
        curr = curr->next;
    }
    return 0;
}

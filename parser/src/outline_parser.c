/**
* Mark Calculator Application
* outline_parser.c - C file that executes a java program to convert
*   PDF to txt format then the c code parses the text file and puts it into 
*   appropiate structs all connected through a linked list
*
* Author - David Eastwood
*/
#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h> 
#include <unistd.h>

#include "outline_parser.h"
#include "LinkedListAPI.h"

#define WORD_LEN 1024
#define TRUE 1
#define FALSE 0
#define NUM_PROGRAMS 45//number of program names listed in the header file
#define DIGIT_SIZE 3
#define NUM_KEYWORDS 80//number of keywords to help identify assessements

#define MIDTERM 0
#define ASSIGNMENT 1
#define GENERIC_ASSESEMENT 2

int _num_words_space = 0;
int _num_words_star = 0;
int _num_words_email_at = 0;
int _num_words_couse_title = 0;
int _num_words_generic = 0;
int _num_words_generic_back = 0;
int _num_words_generic_temp = 0;
int _num_words_generic_parser = 0;

/****************************************************************************************/

Assignment* init_assign()
{
    Assignment* assign = calloc(1, sizeof(Assignment));
    assign->assignment_name = calloc(1, sizeof(char) * WORD_LEN);
    assign->assignment_name[0] = '\0';
    assign->weight = 0.00;
    return assign;
}

Midterm* init_midterm()
{
    Midterm* mid = calloc(1, sizeof(Midterm));
    mid->midterm_name = calloc(1, sizeof(char) * WORD_LEN);
    mid->midterm_name[0] = '\0';
    mid->weight = 0.00;
    return mid;
}

Generic_assesement* init_generic_assesement()
{
    Generic_assesement* generic = calloc(1, sizeof(Generic_assesement));
    generic->generic_assesement_name = calloc(1, sizeof(char) * WORD_LEN);
    generic->generic_assesement_name[0] = '\0';
    generic->weight = 0.00;
    return generic;
}

Grading_schema* init_grading_schema()
{
    Grading_schema* grade = calloc(1, sizeof(Grading_schema));
    grade->final_exam = calloc(1, sizeof(char) * WORD_LEN);
    grade->final_exam[0] = '\0';
    grade->weight = 0.0;
    grade->assignments = initializeList(&assignment_toString, &delete_assignment, &compare_assignment);
    grade->midterms = initializeList(&midterm_toString, &delete_midterm, &compare_midterm);
    grade->generic_assesement = initializeList(&generic_toString, &delete_generic, &compare_generic);
    return grade;
}

Professor* init_prof()
{
    Professor* prof = calloc(1, sizeof(Professor));
    prof->prof_name = calloc(1, sizeof(char) * WORD_LEN);
    prof->email = calloc(1, sizeof(char) * WORD_LEN);
    prof->course_title = calloc(1, sizeof(char) * WORD_LEN);
    prof->prof_name[0] = '\0';
    prof->email[0] = '\0';
    prof->course_title[0] = '\0';
    prof->grading_schema = initializeList(&grade_to_string, &delete_grades, &compare_grades);

    return prof;
}

int compare_generic(const void *first, const void *second)
{
	Generic_assesement* generic1;
	Generic_assesement* generic2;
	if (first == NULL || second == NULL) return 0;
	
	generic1 = (Generic_assesement*)first;
	generic2 = (Generic_assesement*)second;
	
	return strcmp((char*)generic1->generic_assesement_name, (char*)generic2->generic_assesement_name);
}

void delete_generic(void* data)
{
    Generic_assesement* generic = (Generic_assesement*)data;
    if (generic == NULL) { return; }
    free(generic->generic_assesement_name);
    free(generic);
    printf("\nFREEING THE generic STRUCT\n\n\n");
}

char* generic_toString(void* data)
{
    Generic_assesement* generic = (Generic_assesement*)data;
    if (generic == NULL) return NULL;
    char* str = calloc(1, sizeof(char) * (strlen(generic->generic_assesement_name) + 28));
    sprintf(str, "'%s' %.1f", generic->generic_assesement_name, generic->weight);
    return str;
}

int compare_assignment(const void *first, const void *second)
{
	Assignment* assign1;
	Assignment* assign2;
	
	if (first == NULL || second == NULL) return 0;
	
	assign1 = (Assignment*)first;
	assign2 = (Assignment*)second;
	
	return strcmp((char*)assign1->assignment_name, (char*)assign2->assignment_name);
}

void delete_assignment(void* data)
{
    Assignment* assign = (Assignment*)data;
    if (assign == NULL) { return; }
    free(assign->assignment_name);
    free(assign);
    printf("\nFREEING THE assignment STRUCT\n\n\n");
}

char* assignment_toString(void* data)
{
    Assignment* assign = (Assignment*)data;
    if (assign == NULL) return NULL;
    char* str = calloc(1, sizeof(char) * (strlen(assign->assignment_name) + 28));
    sprintf(str, "%s %.1f", assign->assignment_name, assign->weight);
    return str;
}

int compare_midterm(const void *first, const void *second)
{
    return 1;
}

void delete_midterm(void* data)
{
    Midterm* mid = (Midterm*)data;
    if (mid == NULL) { return; }
    free(mid->midterm_name);
    free(mid);
    printf("\nFREEING THE midterm STRUCT\n\n\n");
}

char* midterm_toString(void* data)
{
    Midterm* mid = (Midterm*)data;
    if (mid == NULL) return NULL;
    char* str = calloc(1, sizeof(char) * (strlen(mid->midterm_name) + 28));
    sprintf(str, "%s %.1f", mid->midterm_name, mid->weight);
    return str;
}

int compare_grades(const void *first, const void *second)
{
    printf("in compare grades\n");
    return 1;
}

void delete_grades(void* data)
{
    Grading_schema* grade = (Grading_schema*)data;
    if (grade == NULL) { return; }
    freeList(grade->midterms);
    freeList(grade->assignments);
    freeList(grade->generic_assesement);
    free(grade->final_exam);
    free(grade);
    printf("\nFREEING THE GRADE STRUCT\n\n\n");
}

char* grade_to_string(void* data)
{
    Grading_schema* grade = (Grading_schema*)data;
    if (grade == NULL) return NULL;
    char* str = calloc(1, sizeof(char) * WORD_LEN);
    sprintf(str, "Final exam = '%.1f' %s %s %s", grade->weight, toString(grade->midterms),
            toString(grade->assignments), toString(grade->generic_assesement));

    return str;
}

void free_parser(char** str, int num_words)
{
    if (str == NULL) return;
    for(int i = 0; i < num_words; i++)
    {
        free(str[i]);
    }    
    free(str);
}

void delete_prof(Professor* prof)
{
    if (prof == NULL) {return; }
    if (prof->grading_schema != NULL)
        freeList(prof->grading_schema);
    if (prof->prof_name != NULL)
        free(prof->prof_name);
    if (strlen(prof->email) > 0)
        free(prof->email);
    if (strlen(prof->course_title) > 0)
        free(prof->course_title);
    if (prof != NULL)
        free(prof);
}

void doc_to_string(Professor* prof)
{
    printf("\n******************************************\n");
    printf("Professors name = '%s'\n", prof->prof_name);
    printf("Professors email = '%s'\n", prof->email);
    printf("Course title = %s\n", prof->course_title);
    printf("******************************************\n");

    char* grade_str = toString(prof->grading_schema);
    printf("%s\n", grade_str);
    printf("******************************************\n");

    free(grade_str);
}

int new_line_test(char* doc_str)
{
    for (int j = 0; j < 2; j++)
    {
        if(doc_str[j] == '\n') return TRUE;
    }
    return FALSE;
}
/**
 * Returns true if there is a '%' in the argument string
 */
int contains_percent(char* doc_str)
{
    int length = strlen(doc_str);
    for (int i = 0; i < length; i++)
    {
        if (doc_str[i] == 'x') return FALSE;
        if (doc_str[i] == '%') return TRUE;
    }
    return FALSE;
}
/**
 * Returns true if the string contains ONLY numbers
 */
int is_digit_test(char* str, Is_digit_type type)
{
    int count = 0;
    int length = (type == PERCENT) ? strlen(str) - 1 : strlen(str);

    for (int i = 0 ; i < length; i++)
    {
        // printf("digit %c\n", str[i]);
        if (isdigit(str[i]) || str[i] == ':' || str[i] == '#' || str[i] == '(' ||
            str[i] == ')' || str[i] == '%' || str[i] == ',') 
            count++;
    }
    if (count == length) return TRUE;
    else return FALSE;
}

int upper_case_test(char* str)
{
    int length = strlen(str) + 1;
    for (int i = 0; i < length; i ++)
    {
        if (str[i] == ',' || islower(str[i])) return FALSE;
    }
    return TRUE;
}

int count_space(char* str)
{
    int count = 0;
    int length = strlen(str);
    for (int i = 0; i < length; i++)
    {
        if (str[i] == ' ') { count++; }   
    }
    return count;
}

int count_space_of_double_pointer(char** doc_str, int index)
{
    int count_space = 1;
    for (int j = index; j < index + 7; j++)
    {
        printf("'%s'\n", doc_str[j]);
        if (strcmp(doc_str[j], "") == 0) count_space++;
    }
    return count_space;
}

int all_characters(char* str)
{
    int length = strlen(str) + 1;
    for (int i = 0; i < length; i ++)
    {
        if (isalpha(str[i]) == 0) return FALSE;
    }
    return TRUE;
}

char* strrevstr(char* str)
{
    if (!str) { return NULL; }

    char *begin = str;
    char *end = str + strlen(str) - 1;
    char tmp;
    while (end > begin)
    {
        tmp = *end;
        *end-- = *begin;
        *begin++ = tmp;
    }

    return str;
}

char* remove_space(char* str)
{
    if (!str) { return NULL; }
    char* str_temp = malloc(sizeof(char) * strlen(str) + 1);
    for (int i = 0; i < strlen(str) + 1; i++)
    {
        if (str[0] == ' ')
        {
            str_temp[i] = str[i + 1];
        }
        else
        {
            str_temp[i] = str[i];
        }
    }
    return str_temp;
}

char* remove_second_space(char* str)
{
    if (!str) { return NULL; }
    char* str_temp = malloc(sizeof(char) * strlen(str) + 1);
    int x = 0;

    // printf("ABOUT TO REMOVE = '%s'\n", str);
    for (int i = 0; i < strlen(str) + 1; i++)
    {
        if (str[i] == ' ' && str[i + 1] == ' ' && (isalpha(str[i + 2])  || str[i + 2] == '('))
        {
            i += 1;
            str_temp[x++] = str[i];
        }
        else
        {
            str_temp[x++] = str[i];
        }
    }
    return str_temp;
}

int checkIfNextStructExists(Professor* prof, int type)
{
    void* grading_elem_generic;
    ListIterator iterator_2 = createIterator(prof->grading_schema);
    while ((grading_elem_generic = nextElement(&iterator_2)) != NULL)
    {
        printf("In the while loop\n");
        Grading_schema* grade = (Grading_schema*)grading_elem_generic;
        if (grade == NULL) return FALSE;
        if (type == GENERIC_ASSESEMENT)
        {
            ListIterator ass_iter = createIterator(grade->generic_assesement);
            printf("about to go into statyement\n");
            if (nextElement(&ass_iter) == NULL)
            {
                printf("in the stement\n");
                return FALSE;
            }
            printf("After\n");
        }
        else if (type == ASSIGNMENT)
        {
            ListIterator ass_iter = createIterator(grade->assignments);
            if (nextElement(&ass_iter) == NULL)
            {
                return FALSE;
            }
        }
    }
    return TRUE;
}

void reverse(char* begin, char* end) 
{ 
    char temp = '\0'; 
    while (begin < end) { 
        temp = *begin; 
        *begin++ = *end; 
        *end-- = temp; 
    } 
} 

void reverse_sentence(char* str)
{
    char* word_begin = NULL; 
    char* temp = str;
    while (*temp)
    { 
        if ((word_begin == NULL) && (*temp != ' '))
        { 
            word_begin = temp; 
        } 
        if (word_begin && ((*(temp + 1) == ' ') || (*(temp + 1) == '\0')))
        { 
            reverse(word_begin, temp); 
            word_begin = NULL; 
        } 
        temp++; 
    }
    reverse(str, temp - 1); 
}

/**
 * Adding all the weights togther
 */
double weight_total(Professor* prof)
{
    double total_weight = 0.0;
    void* grading_elem;
    void* mid_elem;
    void* generic_elem;
    void* assign_elem;

    ListIterator iterator = createIterator(prof->grading_schema);
    while ((grading_elem = nextElement(&iterator)) != NULL)
    {
        Grading_schema* grade = (Grading_schema*)grading_elem;
        total_weight += grade->weight;

        ListIterator mid_iter = createIterator(grade->midterms);
        while ((mid_elem = nextElement(&mid_iter)) != NULL)
        {
            Midterm* midterm = (Midterm*)mid_elem;
            total_weight += midterm->weight;
        }

        ListIterator assign_iter = createIterator(grade->assignments);
        while ((assign_elem = nextElement(&assign_iter)) != NULL)
        {
            Assignment* assign = (Assignment*)assign_elem;
            total_weight += assign->weight;    
        }

        ListIterator generic_iter = createIterator(grade->generic_assesement);
        while ((generic_elem = nextElement(&generic_iter)) != NULL)
        {
            Generic_assesement* generic = (Generic_assesement*)generic_elem;
            total_weight += generic->weight;    
        }
    }

    return total_weight;
}

double total_weight_midterm_final_assignment(Professor* prof)
{
    double total_weight = 0.0;
    void* grading_elem;
    void* mid_elem;
    void* assign_elem;

    ListIterator iterator = createIterator(prof->grading_schema);
    while ((grading_elem = nextElement(&iterator)) != NULL)
    {
        Grading_schema* grade = (Grading_schema*)grading_elem;
        total_weight += grade->weight;

        ListIterator mid_iter = createIterator(grade->midterms);
        while ((mid_elem = nextElement(&mid_iter)) != NULL)
        {
            Midterm* midterm = (Midterm*)mid_elem;
            total_weight += midterm->weight;
        }

        ListIterator assign_iter = createIterator(grade->assignments);
        while ((assign_elem = nextElement(&assign_iter)) != NULL)
        {
            Assignment* assign = (Assignment*)assign_elem;
            total_weight += assign->weight;    
        }
    }

    return total_weight;
}

int check_total_weight(Professor* prof, double weight_to_be_added)
{
    double total_weight = total_weight_midterm_final_assignment(prof);
    total_weight += weight_to_be_added;
    if (total_weight > 100 || total_weight > 100)
    {
        return FALSE;
    }
    return TRUE;
}

/**
 * This function removes duplicates that were added to the mark table
 * @return if a dubplcate was detected you return TRUE if no dubplicate return FALSE
 */
int check_duplicates(Professor* prof)
{ 
    void* grading_elem;
    Node* cur_node = NULL;
    Node* cur_node_temp = NULL;

    ListIterator iterator = createIterator(prof->grading_schema);
    while ((grading_elem = nextElement(&iterator)) != NULL)
    {
        Grading_schema* grade = (Grading_schema*)grading_elem;
        List* generic_list = (List*)grade->generic_assesement;

        Generic_assesement* generic_back = getFromBack(generic_list);

        cur_node = generic_list->head;
        cur_node_temp = generic_list->head;
        
        while (cur_node != NULL)
        {
            if (cur_node->next == NULL)
            {
                cur_node_temp = cur_node;
            }
            else { cur_node_temp = cur_node->next; }
            Generic_assesement* generic = (Generic_assesement*)cur_node->data;
            
            printf("\nFISRT = %s %.1f\n", generic->generic_assesement_name, generic->weight);
            char** genric_space = split(generic->generic_assesement_name, " ", GENERIC, FALSE);

            if (count_space(generic->generic_assesement_name) == 0)
            {
                _num_words_generic += 1;
            }

            while (cur_node_temp != NULL)
            {
                int deleted = 0;
                Generic_assesement* generic_temp = (Generic_assesement*)cur_node_temp->data;
                printf("\tSECOND = %s %.1f\n", generic_temp->generic_assesement_name, generic_temp->weight);
                
                char** genric_space_temp = split(generic_temp->generic_assesement_name, " ", GENERIC_TEMP, FALSE);
                char** generic_back_space = split(generic_back->generic_assesement_name, " ", GENERIC_BACK, FALSE);
        
                if (count_space(generic_temp->generic_assesement_name) == 0)
                {
                    _num_words_generic_temp += 1;
                }
    
                printf("%d, %d\n", _num_words_generic, _num_words_generic_temp);
                for (int i = 0; i < _num_words_generic; i++)
                {
                    printf("    compare = '%s'", genric_space[i]);
                    for (int j = 0; j < _num_words_generic_temp; j++)
                    {
                        printf("=== '%s'\n", genric_space_temp[j]);
                        if (deleted == 0 && strcmp(genric_space[i], genric_space_temp[j]) == 0 &&
                                generic->weight == generic_temp->weight &&
                                    strlen(genric_space[i]) > 0 && strlen(generic_back_space[j]) > 0 &&
                                strcmp(generic->generic_assesement_name, generic_back->generic_assesement_name) != 0 &&
                            all_characters(genric_space_temp[j]) == TRUE)
                        {                               
                            printf("\tThis should be removed!!!\n");
                            Generic_assesement* delete = deleteDataFromList(grade->generic_assesement, (Generic_assesement*)generic_temp);
                            delete_generic(delete);
                            deleted = 1;
                        }
                    }
                    
                    // printf("compare == %s ==== %s\n", generic->generic_assesement_name, generic_temp->generic_assesement_name);
                    if (strcmp(generic->generic_assesement_name, generic_back->generic_assesement_name) != 0)
                    {
                        if (deleted == 0 && strcmp(generic->generic_assesement_name, generic_temp->generic_assesement_name) == 0&& 
                                generic->weight == generic_temp->weight)
                        {
                            printf("\tDeleting!!!\n\n");
                            Generic_assesement* delete = deleteDataFromList(grade->generic_assesement, (Generic_assesement*)generic_temp);
                            delete_generic(delete);
                            deleted = 1;
                        }
                    }
                }
            
                _num_words_generic_temp = _num_words_generic_back = deleted = 0;
                if (cur_node_temp->next == NULL) { break; }
                cur_node_temp = cur_node_temp->next;
            }
            /*Delete nodes that make the total weight greater than 100*/
            _num_words_generic = 0;
            if (cur_node->next == NULL) { break; }
            cur_node = cur_node->next;
        }
    }

    return FALSE;
}

void remove_after_100(Professor* prof)
{
    double total_weight = total_weight_midterm_final_assignment(prof);
    void* grading_elem;
    void* generic_elem;

    ListIterator iterator = createIterator(prof->grading_schema);
    while ((grading_elem = nextElement(&iterator)) != NULL)
    {
        Grading_schema* grade = (Grading_schema*)grading_elem;

        ListIterator generic_iter = createIterator(grade->generic_assesement);
        while ((generic_elem = nextElement(&generic_iter)) != NULL)
        {
            Generic_assesement* generic = (Generic_assesement*)generic_elem;
            if (total_weight + generic->weight > 100)
            {
                Generic_assesement* delete = deleteDataFromList(grade->generic_assesement, (Generic_assesement*)generic);
                delete_generic(delete);
            }
            else
            {
                total_weight += generic->weight;
            }
        }
    }
}

/**
 * Forks another process to run my Java program to convert a PDF
 * to a text file and place it in the uploads directory
 * @return TRUE if success
 */
int execute_java_program_PDF_to_TXT(char* file_name)
{
    printf("file_name = %s\n", file_name);
    if (strlen(file_name) <= 0)
    {
        return FALSE;
    }

    char* run_argv_converter[] = {"java", "-cp" , "./bin/pdfbox-app-2.0.17.jar:",
            "converter", "../files/acct_3350.pdf", NULL};

    pid_t pid = fork();
	int status;
    printf("ABout to fork a process\n");
	if (pid == 0)//pid == 0 indicating the child process
    {
        printf("PID =========== 0 \n");
        if (execvp(*run_argv_converter, run_argv_converter) < 0)
        {
            printf(": command(s) can't be executed\n");
            exit(1);//terminate process
            printf("Error\n");
            return FALSE;
        }
        printf("Just finished running the java program!\n");
	}
    else if((pid) < 0)//if fork returned -1 then it failed to make a child process
    {	
        printf("Error in the java program!\n");
        fprintf(stderr, "fork() failed!\n");
    	exit(1);
        return FALSE;
    }
    else//for the parent
    {    
        printf("Waiting for java program to execute\n");
        while (!(wait(&status) == pid));//waiting for child process to finish
    }

    printf("returning true\n");
    return TRUE;
}

/**
 * Parsing functions that splits based on a character and newlines
 * @return an array of parsed strings
 */
char** split(char* line, char* delm, Parse_type type, int check_space)
{
	char** strings = calloc(1, sizeof(char*));//allocate some initial memory for the string
	int row = 0, col = 0;
	int memsize1 = 10, memsize2 = 10;
	strings[0] = calloc(memsize2, sizeof(char) + 1);
    int length = strlen(line) + 1;

    if (check_space == TRUE)
    {
        if (count_space(line) == 1)
        {
            int x = 0;
            for(int i = 0; i < length; i++)
            {
                (line[i] != ' ') ? strings[0][x++] = line[i] : 0;
            }
            return strings;
        }
    }   

	for (int i = 0; i < length; i++)
    {
        // if (line[i] == NULL) return strings;
        if (line[i] != delm[0] && line[i] != '\n')
        {
			memsize2++;
			strings[row] = realloc(strings[row], memsize2 * sizeof(char) + 1);//re-allocate memory for the string
			strings[row][col] = line[i];
			col++;
		}
        else
        {
            if (type == SPACE) _num_words_space++;
            else if (type == STAR) _num_words_star++;
            else if (type == EMAIL_AT) _num_words_email_at++;
            else if (type == GENERIC) _num_words_generic++;
            else if (type == GENERIC_TEMP) _num_words_generic_temp++;
            else if (type == GENERIC_BACK) _num_words_generic_back++;
            else if (type == COURSE_TITLE) _num_words_couse_title++;
            else if (type == REMOVE_SPACE) _num_words_generic_parser++;
			col = 0;
			row++;
			memsize2 = 10;
			memsize1++;
			strings = realloc(strings, memsize1 * sizeof(char*));
			strings[row] = calloc(memsize2, sizeof(char) + 1);
		}
	}
	strings[row + 1] = NULL;//end of the string
	return strings;
}

Professor* parse_prof_info(char** doc_str, char** doc_str_title, char* original_doc_str)
{
    Professor* prof = init_prof();
    char course_title[64] = {0};
    char prof_name[64] = {0};

    printf("Number of sapces in the doxument %d\n", _num_words_space);
    for (int i = 0; i < _num_words_space; i++)
    {
        // printf("{%s}", doc_str[i]);
        if (strcmp(doc_str[i], "Instructor:") == 0 || strcmp(doc_str[i], "Professor") == 0 ||
                strcmp(doc_str[i], "Instructor") == 0 || strcmp(doc_str[i], "Instructors:") == 0 ||
                    strcmp(doc_str[i], "INSTRUCTORS") == 0 || strcmp(doc_str[i], "INSTRUCTOR") == 0) 
        {   
            printf("prof->prof_name = %s\n", prof->prof_name);
            if (strlen(prof->prof_name) == 0)
            {
                printf("prof->name is greater than 0\n\n");
                int num_space = count_space_of_double_pointer(doc_str, i);
                if (num_space > 2)
                {
                    printf("name at %d name '%s'", num_space, doc_str[i + num_space]);
                    strcat(prof_name, doc_str[i + num_space]);
                    strcat(prof_name, " ");
                    strcat(prof_name, doc_str[i + (num_space + 1)]);
                    strcpy(prof->prof_name, prof_name);
                }

                if (strlen(doc_str[i + 1]) > 0 && strlen(doc_str[i + 2]) > 0)
                {
                    printf("in if statement\n\n");

                    strcat(prof_name, doc_str[i + 1]);
                    strcat(prof_name, " ");
                    strcat(prof_name, doc_str[i + 2]);
                    if (new_line_test(doc_str[i + 3]) == FALSE && upper_case_test(doc_str[i + 3]) == FALSE &&
                            strcmp(doc_str[i + 3], "Office") != 0 && strcmp(doc_str[i + 3], "PhD,") != 0 &&
                                strcmp(doc_str[i + 3], "PhD") != 0 && strcmp(doc_str[i + 3], "Ph.D.,") != 0 &&
                                    strcmp(doc_str[i + 3], "Ph.D,") != 0  && strcmp(doc_str[i + 3], "MA,") != 0 &&
                                        strcmp(doc_str[i + 3], "MA") != 0 && strcmp(doc_str[i + 3], "MEd,") != 0)
                    {                    
                        strcat(prof_name, " ");
                        strcat(prof_name, doc_str[i + 3]);
                    }
                    printf("prof->name %s\n", prof_name);
                    strcpy(prof->prof_name, prof_name);
                }
                else if (strlen(doc_str[i + 2]) > 0 && strlen(doc_str[i + 3]) > 0)
                {
                    printf("in if else statement\n\n");
                    strcat(prof_name, doc_str[i + 2]);
                    strcat(prof_name, " ");
                    strcat(prof_name, doc_str[i + 3]);
                    if (new_line_test(doc_str[i + 4]) == FALSE && upper_case_test(doc_str[i + 4]) == FALSE)
                    {
                        strcat(prof_name, " ");
                        strcat(prof_name, doc_str[i + 4]);
                    }
                    strcpy(prof->prof_name, prof_name);
                }
            }
        }
    }
    printf("about to enter the professors email\n");
    /*Getting Professors email address*/
    // if (strlen(prof->email) == 0)
    // {
        char temp_str_front[32] = {0};
        char temp_str_back[32] = {0};

        int x = 0;
        int count = 0;
        int length = strlen(original_doc_str) + 1;
        printf("length = %d\n", length);

        for (int i = 0; i < length; i++)
        {
            if (original_doc_str[i] == '@' && count == 0)
            {
                for (int j = i - 1; j != i - 20; j--)
                {
                    if (original_doc_str[j] == ' ' || original_doc_str[j] == ':' ||
                        original_doc_str[j] == '\n' || original_doc_str[j] == '(') break;
                    else temp_str_front[x++] = original_doc_str[j]; 
                }
                x = 0;//reset the index
                for (int j = i + 1; j < i + 20; j++)
                {
                    if (original_doc_str[j] == ' ' || original_doc_str[j] == '\n' ||
                        original_doc_str[j] == '(') break;
                    else temp_str_back[x++] = original_doc_str[j]; 
                }

                if (strlen(temp_str_front) > 0)
                {    
                    x = 0;
                    count = 1;
                    strrevstr(temp_str_front);//reverse the string
                    strcat(prof->email, temp_str_front);
                    strcat(prof->email, "@uoguelph.ca");
                }
            }
        }
    // }
    // printf("Prof -> email %s\n", prof->email);
    /*First way of finding the course title*/
    // if (strlen(course_title) == 0)
    // {
        for (int i = 0; i < 50; i++)
        {
            for (int j = 0; j < NUM_PROGRAMS; j++)
            {
                if (strcmp(doc_str[i], _program_name[j]) == 0)
                {
                    printf("Using program %s\n", doc_str[i]);
                    if (is_digit_test(doc_str[i + 1], NON_PERCENT) == TRUE)
                    {
                        strcat(course_title, doc_str[i]);
                        strcat(course_title, " ");
                        strcat(course_title, doc_str[i + 1]);
                        strcpy(prof->course_title, course_title);
                    }
                    else if (is_digit_test(doc_str[i + 2], NON_PERCENT) == TRUE)
                    {
                        strcat(course_title, doc_str[i + 1]);
                        strcat(course_title, " ");
                        strcat(course_title, doc_str[i + 2]);
                        strcpy(prof->course_title, course_title);
                    }
                }
            }
        }
    // }
    /*Second way of finding the course title*/
    // if (strlen(course_title) == 0)
    // {
        for (int i = 0; i < _num_words_star; i++)
        {
            for (int j = 0; j < NUM_PROGRAMS; j++)
            {
                if (strcmp(doc_str_title[i], _program_name[j]) == 0)
                {
                    char** doc_str_space = split(doc_str_title[i + 1], " ", COURSE_TITLE, FALSE);
                    if (is_digit_test(doc_str_space[0], NON_PERCENT) == TRUE && strlen(course_title) == 0)
                    {
                        strcat(course_title, doc_str_title[i]);
                        strcat(course_title, " ");
                        strcat(course_title, doc_str_space[0]);
                        strcpy(prof->course_title, course_title);
                    }
                    free_parser(doc_str_space, _num_words_couse_title);
                    _num_words_couse_title = 0;
                }
            }
        }
    // }

    printf("done with the professor\n");
    return prof;
}

char* parser_percentage(char* prev_str, char* next_str)
{
    int x = 0;
    int length_prev = strlen(prev_str);
    int length_next = strlen(next_str);

    char* number_str_prev = calloc(1, sizeof(char) * DIGIT_SIZE);
    number_str_prev[0] = '\0';


    for (int i = 0; i < length_prev; i++)
    {
        if (prev_str[i] == '%' && prev_str[i + 1] == '.')
        {
            return number_str_prev;
        }
    }
    for (int i = 0; i < length_next; i++)
    {
        if (next_str[i] == '%' && next_str[i + 1] == '.')
        {
            return number_str_prev;
        }
    }
    int flag = 0;
    int length = 0;
    printf(" prev = '%s' , next_str = '%s'\n", prev_str, next_str);
    for (int i = 0; i < length_prev; i++)
    {
        printf("gg = %c\n", prev_str[i]);
        if (prev_str[i] == '%')
        {
            flag = 1;
            for(int j = i; j != i - length_prev; j--)
            {
                isdigit(prev_str[j]) || prev_str[j] == '.' 
                    ? number_str_prev[x++] = prev_str[j] : 0;
            }
        }
        if (flag == 0 && isdigit(prev_str[i]))//case where 15 %, the % is seperated from the number
        {
            length += 1;
        }
    }
    if (flag == 0 && length == strlen(prev_str) && strlen(prev_str) > 0) return prev_str;

    // if (is_digit_test(prev_str, NON_PERCENT) == TRUE) return prev_str;// 15 % case study, example why i put this here
    x = 0;
    if (is_digit_test(number_str_prev, PERCENT) == FALSE)
    {
        //make sure there is a percent apart of the number
        char* number_str_next = calloc(1, sizeof(char) * DIGIT_SIZE);
        number_str_next[0] = '\0';
        for (int i = 0; i != '%'; i++)
        {
            if (next_str[i] == '%') break; 
            isdigit(next_str[i]) || next_str[i] == '.'
                ? number_str_next[x++] = next_str[i] : 0;
        }
        printf("number string next = %s\n", number_str_next);
        if (strcmp(number_str_next, number_str_prev) == 0) return number_str_prev;
        return number_str_next;
    }
    printf("AFTER\n\n");
    strrevstr(number_str_prev);

    // printf("number string prev = %s\n", number_str_prev);

    /*Another % parser if there is an extra space between the assessment and the % */

    return number_str_prev;
}

int count_space_until_percentage(char** split_file, int index)
{
    for (int j = index; j < index + 7; j++)
    {
        printf(" HH '%s'\n", split_file[j]);
        if (strcmp(split_file[j], " ") == 0) break;
        // if (is_digit_test(split_file[j], PERCENT) == TRUE && strcmp(split_file[j], "*") != 0)
        if (is_digit_test(split_file[j], PERCENT) == TRUE && strcmp(split_file[j], "*") != 0)
        {
            return j;
        }
    }

    for (int j = index; j > index - 6; j--) 
    {
        if (strcmp(split_file[j], " ") == 0) break;
        // if (is_digit_test(split_file[j], PERCENT) == TRUE && strcmp(split_file[j], "*") != 0)
        if (is_digit_test(split_file[j], PERCENT) == TRUE && strcmp(split_file[j], "*") != 0)
        {
            return j;
        }
    }   
    return -10;//i know the value will never reach -10
}


Generic_assesement* parser_generic_assesement(char** split_file, int i)
{
    Generic_assesement* generic  = init_generic_assesement();
    int count = 0;
    for (int j = i; j < i + 6; j++)
    {
        printf("forward split_file == %s\n", split_file[j]);
        if (strcmp(split_file[j - 1], "x") == 0 || strcmp(split_file[j + 1], "x") == 0) break;
        count++;
        if (contains_percent(split_file[j]) == TRUE && strcmp(split_file[j - 1], "@") != 0 &&
                strcmp(split_file[j + 1], "@") != 0)
        {
            printf("COUNT = %d\n", count);
            for (int x = j; x > j - count; x--)
            {
                printf("split = '%s'\n", split_file[x - 1]);
                if (contains_percent(split_file[x]) == FALSE && count_space(split_file[x]) == 0 &&
                        strcmp(split_file[x], "@") != 0 && strcmp(split_file[x], "each") != 0)
                {
                    strcat(generic->generic_assesement_name, split_file[x]);
                    strcat(generic->generic_assesement_name, " ");
                }
            }
            (strlen(generic->generic_assesement_name) > 0) ? 
                reverse_sentence(generic->generic_assesement_name) : 0;

            char* percentage = parser_percentage("", split_file[j]);
            if (percentage == NULL) break;
            generic->weight = strtod(percentage, NULL);
            printf("!!!!!!percentage for projects exam = %s %.1f\n", generic->generic_assesement_name, generic->weight);
            free(percentage);
            break;
        }
    }

    if (generic->weight == 0.0)
    {
        count = 0;
        for (int j = i; j > i - 6; j--) 
        {   
            printf("back split_file = %s\n", split_file[j]);
            if (strcmp(split_file[j - 1], "x") == 0 || strcmp(split_file[j + 1], "x") == 0) break;
            count++;
            if (contains_percent(split_file[j]) == TRUE && strcmp(split_file[j - 1], "@") != 0 &&
                strcmp(split_file[j + 1], "@") != 0)
            {
                for (int x = j; x < j + count; x++)
                {
                    if (contains_percent(split_file[x]) == FALSE && count_space(split_file[x]) == 0 && 
                            strcmp(split_file[x], "@") != 0 && strcmp(split_file[x], "each") != 0)
                    {
                        strcat(generic->generic_assesement_name, split_file[x]);
                        strcat(generic->generic_assesement_name, " ");
                    }
                }
                printf("\ngenric = %s\n", generic->generic_assesement_name);
                char* percentage = calloc(1, sizeof(char) * 12);

                if (strcmp(split_file[j], "%") == 0)
                {
                    printf("+++ \n");
                    strcpy(percentage, parser_percentage(split_file[j - 1], split_file[j + 1]));
                    generic->weight = strtod(percentage, NULL);
                    printf("percentage for projects exam = %s %.1f\n", generic->generic_assesement_name, generic->weight);
                    printf("PERCENTAn if  %s\n", percentage);

                    free(percentage);
                }
                else
                {
                    strcpy(percentage, parser_percentage("", split_file[j]));
                    generic->weight = strtod(percentage, NULL);
                    printf("percentage for projects exam = %s %.1f\n", generic->generic_assesement_name, generic->weight);
                    printf("PERCENTAn else  %s\n", percentage);

                    free(percentage);

                }
                // generic->weight = strtod(percentage, NULL);
                // printf("percentage for projects exam = %s %.1f\n", generic->generic_assesement_name, generic->weight);
                // free(percentage);
                break;
            }
        }
    }

    char* no_second_space_str = remove_second_space((char*)generic->generic_assesement_name);
    char* str = remove_space(no_second_space_str);
    printf("'%s' and '%s'\n\n\n", generic->generic_assesement_name, str);
    if (strlen(str) > 0)
    {
        strcpy(generic->generic_assesement_name, "");
        strcat(generic->generic_assesement_name, str);
    }
    return generic;
}

Midterm* parser_midterm(char** split_file, int i)
{
    // Midterm* mid = init_midterm();
    // int count = 0;
    // for (int j = i; j < i + 6; j++)
    // {
    //     printf("forward split_file == %s\n", split_file[j]);
    //     if (strcmp(split_file[j - 1], "x") == 0 || strcmp(split_file[j + 1], "x") == 0) break;
    //     count++;
    //     if (contains_percent(split_file[j]) == TRUE)
    //     {
    //         printf("COUNT = %d\n", count);
    //         for (int x = j; x > j - count; x--)
    //         {
    //             printf("split = '%s'\n", split_file[x - 1]);
    //             if (contains_percent(split_file[x]) == FALSE && count_space(split_file[x]) == 0)
    //             {
    //                 strcat(mid->midterm_name, split_file[x]);
    //                 strcat(mid->midterm_name, " ");
    //             }
    //         }
    //         (strlen(mid->midterm_name) > 0) ? 
    //             reverse_sentence(mid->midterm_name) : 0;

    //         char* percentage = parser_percentage("", split_file[j]);
    //         if (percentage == NULL) break;
    //         mid->weight = strtod(percentage, NULL);
    //         printf("!!!!!!percentage for projects exam = %s %.1f\n", mid->midterm_name, mid->weight);
    //         free(percentage);
    //         break;
    //     }
    // }

    // if (mid->weight == 0.0)
    // {
    //     count = 0;
    //     for (int j = i; j > i - 6; j--) 
    //     {   
    //         printf("back split_file = %s\n", split_file[j]);
    //         if (strcmp(split_file[j - 1], "x") == 0 || strcmp(split_file[j + 1], "x") == 0) break;
    //         count++;
    //         if (contains_percent(split_file[j]) == TRUE)
    //         {
    //             for (int x = j; x < j + count; x++)
    //             {
    //                 if (contains_percent(split_file[x]) == FALSE && count_space(split_file[x]) == 0 && 
    //                     strcmp(split_file[x -1], "x") != 0 && strcmp(split_file[x + 1], "x") != 0)
    //                 {
    //                     strcat(mid->midterm_name, split_file[x]);
    //                     strcat(mid->midterm_name, " ");
    //                 }
    //             }
    //             printf("\ngenric = %s\n", mid->midterm_name);
    //             char* percentage = parser_percentage("", split_file[j]);
    //             printf("PERCENTAn\n");
    //             // if (strlen(percentage) > 0) break;// possible bug!!!!!!!!!
    //             mid->weight = strtod(percentage, NULL);
    //             printf("percentage for projects exam = %s %.1f\n", mid->midterm_name, mid->weight);
    //             free(percentage);
    //             break;
    //         }
    //     }
    // }

    // char* no_second_space_str = remove_second_space((char*)mid->midterm_name);
    // char* str = remove_space(no_second_space_str);
    // printf("STRING = %s\n", str);

    // strcpy(mid->midterm_name, "");
    // strcat(mid->midterm_name, str);
    Midterm* mid = init_midterm();
    strcat(mid->midterm_name, "Midterm");

    if (contains_percent(split_file[i - 2]) == TRUE || contains_percent(split_file[i + 2]) == TRUE)
    {
        char* percentage = parser_percentage(split_file[i + 2], split_file[i - 2]);
        mid->weight = strtod(percentage, NULL);
        printf("percentage for midterm exam 1 = %s %.1f\n", mid->midterm_name, mid->weight);
        free(percentage);
    }
    else if (contains_percent(split_file[i + 3]) == TRUE)
    {
        char* percentage = parser_percentage("", split_file[i + 3]);
        mid->weight = strtod(percentage, NULL); 
        printf("percentage for midterm exam 2 = %s %.1f\n", mid->midterm_name, mid->weight);
        free(percentage);
    }
    else if (contains_percent(split_file[i - 1]) == TRUE || contains_percent(split_file[i + 1]) == TRUE)
    {
        char* percentage = parser_percentage(split_file[i - 1], split_file[i + 1]);
        mid->weight = strtod(percentage, NULL); 
        printf("percentage for midterm exam 3 = %s %.1f\n", mid->midterm_name, mid->weight);
        free(percentage);
    }

        

    // if (mid->weight > 0.0 && is_digit_test(split_file[i + 2], NON_PERCENT) == TRUE)
    // {
    //     strcat(mid->midterm_name, split_file[i + 2]);
    // }
    // else if (mid->weight > 0.0 && is_digit_test(split_file[i + 1], NON_PERCENT) == TRUE)
    // {
    //     strcat(mid->midterm_name, split_file[i + 1]);
    // }

    return mid;
}

Assignment* parser_assignment(char** split_file, int i)
{
    Assignment* assign = init_assign();
    int count = 0;
    for (int j = i; j < i + 6; j++)
    {
        printf("forward split_file == %s\n", split_file[j]);
        if (strcmp(split_file[j - 1], "x") == 0 || strcmp(split_file[j + 1], "x") == 0) break;
        char temp_split_file[32] = {0};
        strcpy(temp_split_file, split_file[j]);
        for (int r = 0; r < strlen(split_file[j]); r++)
        {
            if (temp_split_file[r] == 'x')
            {
                printf("BREAKING found x in %s\n", temp_split_file);
                break;
            }
        }
        count++;
        if (contains_percent(split_file[j]) == TRUE)
        {
            printf("COUNT = %d\n", count);
            for (int x = j; x > j - count; x--)
            {
                printf("split = '%s'\n", split_file[x - 1]);
                if (contains_percent(split_file[x]) == FALSE && count_space(split_file[x]) == 0)
                {
                    strcat(assign->assignment_name, split_file[x]);
                    strcat(assign->assignment_name, " ");
                }
            }
            (strlen(assign->assignment_name) > 0) ? 
                reverse_sentence(assign->assignment_name) : 0;

            char* percentage = parser_percentage("", split_file[j]);
            if (percentage == NULL) break;
            assign->weight = strtod(percentage, NULL);
            printf("!!!!!!percentage for projects exam = %s %.1f\n", assign->assignment_name, assign->weight);
            free(percentage);
            break;
        }
    }

    if (assign->weight == 0.0)
    {
        count = 0;
        for (int j = i; j > i - 6; j--) 
        {   
            printf("back split_file = %s\n", split_file[j]);
            if (strcmp(split_file[j], "penalty.") == 0) break;//special case
            if (strcmp(split_file[j - 1], "x") == 0 || strcmp(split_file[j + 1], "x") == 0) break;
            count++;
            if (contains_percent(split_file[j]) == TRUE)
            {
                for (int x = j; x < j + count; x++)
                {
                    if (contains_percent(split_file[x]) == FALSE && count_space(split_file[x]) == 0 && 
                        strcmp(split_file[x - 1], "x") != 0 && strcmp(split_file[x + 1], "x") != 0)
                    {
                        strcat(assign->assignment_name, split_file[x]);
                        strcat(assign->assignment_name, " ");
                    }
                }
                printf("\ngenric = %s\n", assign->assignment_name);
                char* percentage = parser_percentage("", split_file[j]);
                printf("PERCENTAn\n");

                assign->weight = strtod(percentage, NULL);
                printf("percentage for projects exam = %s %.1f\n", assign->assignment_name, assign->weight);
                free(percentage);
                break;
            }
        }
    }

    char* no_second_space_str = remove_second_space((char*)assign->assignment_name);
    char* str = remove_space(no_second_space_str);
    printf("STRING = %s\n", str);

    strcpy(assign->assignment_name, "");
    strcat(assign->assignment_name, str);

    return assign;
}

Professor* parse_document(char* doc_str)
{
    Grading_schema* grade = init_grading_schema();
    char** split_file = split(doc_str, " ", SPACE, FALSE);
    char** split_file_title = split(doc_str, "*", STAR, FALSE);
    /*Gets the professors info email, name and name of the courese*/
    Professor* prof = parse_prof_info(split_file, split_file_title, doc_str);

    printf("prof now has name\n\n");
    for (int i = 0; i < _num_words_space; i++)
    {
        // printf("[%s]", split_file[i]);
        if ((strcmp(split_file[i], "Final") == 0 || strcmp(split_file[i], "final") == 0) && (strcmp(split_file[i + 1], "exam") == 0 ||
                strcmp(split_file[i + 1], "Examination") == 0 || strcmp(split_file[i + 1], "Exam") == 0 ||
                    strcmp(split_file[i + 1], "Exam:") == 0 || strcmp(split_file[i + 1], "exam:") == 0 || 
                        strcmp(split_file[i + 1], "examination") == 0 || strcmp(split_file[i + 1], "examination:") == 0))
        {
            printf("FINAL: EXAM '%s' '%s'\n", split_file[i + 1], split_file[i +  2]);
            if (grade->weight == 0.00)
            {
                if (contains_percent(split_file[i - 1]) == TRUE)
                {
                    char* percentage = parser_percentage(split_file[i - 1], split_file[i + 1]);
                    grade->weight = strtod(percentage, NULL); 
                    printf("percentage1 %f\n", grade->weight);
                    free(percentage);
                }
                else if (contains_percent(split_file[i + 2]) == TRUE)
                {
                    char* percentage = parser_percentage(split_file[i - 1], split_file[i + 2]);
                    grade->weight = strtod(percentage, NULL); 
                    printf("percentage2 %f\n", grade->weight);
                    free(percentage);
                }
                else if (contains_percent(split_file[i + 3]) == TRUE)
                {
                    printf("YESSS HH\n");
                    char* percentage = parser_percentage(split_file[i - 1], split_file[i + 3]);
                    grade->weight = strtod(percentage, NULL); 
                    printf("percentage3 %f\n", grade->weight);
                    free(percentage);
                }
                else
                {
                    int indexOfPercentage = count_space_until_percentage(split_file, i);
                    printf("index of = %d\n", indexOfPercentage);
                    if (indexOfPercentage != -10)
                    {
                        char* percentage = parser_percentage(split_file[indexOfPercentage], " ");
                        grade->weight = strtod(percentage, NULL); 
                        printf("percentage4 %f\n", grade->weight);
                        free(percentage);
                    }
                }
            }
        }
        if (strcmp(split_file[i], "Midterm:") == 0 && is_digit_test(split_file[i + 1], NON_PERCENT))
        {
            printf("MIDTERM1\n\n");
            Midterm* midterm = parser_midterm(split_file, i);
            if (midterm->weight > 0.0) insertBack(grade->midterms, midterm);//inserting into the linked list
        }

        if (strcmp(split_file[i], "Midterm:") == 0 || (strcmp(split_file[i], "Mid") == 0 &&
                strcmp(split_file[i + 1], "Term") == 0 && (strcmp(split_file[i + 3], "Exam") == 0)) ||
                    (strcmp(split_file[i], "Exam") == 0 &&
                is_digit_test(split_file[i + 1], NON_PERCENT) == TRUE && strcmp(split_file[i - 1], "Term") != 0) ||
                    (strcmp(split_file[i], "Mid-term") == 0 && strcmp(split_file[i + 1], "exam") == 0) ||
                (strcmp(split_file[i], "Mid-term") == 0 && strcmp(split_file[i + 1], "Exam:") == 0) ||
                    (strcmp(split_file[i], "Midterm") == 0 &&
                    (strcmp(split_file[i + 1], "Exam") == 0 || strcmp(split_file[i + 1], "Exam:") == 0 ||
                strcmp(split_file[i + 1], "Test") == 0 || strcmp(split_file[i + 1], "examination:") == 0 ||
                    strcmp(split_file[i + 1], "Examination:") == 0  || strcmp(split_file[i + 1], "Examination") == 0 || 
                strcmp(split_file[i + 1], "examination") == 0 || strcmp(split_file[i + 1], "exam") == 0 ||
                    strcmp(split_file[i + 1], "exam:") == 0)))
        {
           printf("MIDTERM2 '%s' '%s'\n\n", split_file[i + 2], split_file[i + 3]);
            if (is_digit_test(split_file[i - 1], PERCENT) == TRUE ||
                    is_digit_test(split_file[i + 2], PERCENT) == TRUE ||
                        is_digit_test(split_file[i - 2], PERCENT) == TRUE ||
                    is_digit_test(split_file[i + 3], PERCENT) == TRUE)
            {
                printf("MIDTERM2\n\n");
                if (strcmp(split_file[i + 2], "=") == 0 && contains_percent(split_file[i + 3]) == TRUE) 
                {
                    printf("In frst midterm case\n");
                    Midterm* mid = init_midterm();
                    strcat(mid->midterm_name, "Midterm");
                    char* percentage = parser_percentage(split_file[i + 3], "");
                    mid->weight = strtod(percentage, NULL);
                    printf("percentage for midterm exam 1 = %s %.1f\n", mid->midterm_name, mid->weight);
                    free(percentage);
                    if (mid->weight > 0.0) insertBack(grade->midterms, mid);//inserting into the linked list
                }
                else if (strcmp(split_file[i - 1], "Midterm") != 0)
                {
                    printf("\n>>>>>>midterm exam!!!!!\n");
                    Midterm* midterm = parser_midterm(split_file, i);
                    if (midterm->weight > 0.0) insertBack(grade->midterms, midterm);//inserting into the linked list
                }
            }
        }

        if (strcmp(split_file[i], "Assignment") == 0 || strcmp(split_file[i], "Assignment:") == 0 ||
                strcmp(split_file[i], "Assignments") == 0 || strcmp(split_file[i], "Assignments:") == 0 ||
                    strcmp(split_file[i], "assignment:") == 0 || strcmp(split_file[i], "assignments") == 0)
        {
            printf("\n\nASSIGNMENT = %s\n", split_file[i + 1]);
            if (is_digit_test(split_file[i + 1], PERCENT) == TRUE || is_digit_test(split_file[i - 1], PERCENT) == TRUE ||
                    check_total_weight(prof, 0) == TRUE)
            {
                Assignment* assign = parser_assignment(split_file, i);
                if (assign->weight > 0.0) insertBack(grade->assignments, assign);
            }
        }
        
        if (strcmp(split_file[i], "Lab") == 0)
        {
            if (is_digit_test(split_file[i - 1], NON_PERCENT) == TRUE || 
                    is_digit_test(split_file[i + 2], NON_PERCENT) == TRUE)
            {
                Generic_assesement* generic = init_generic_assesement();
                strcat(generic->generic_assesement_name, "Lab Exercise ");
                if (contains_percent(split_file[i - 1]) == TRUE || contains_percent(split_file[i + 2]) == TRUE)
                {
                    char* percentage = parser_percentage(split_file[i - 1], split_file[i + 2]);
                    generic->weight = strtod(percentage, NULL);
                    free(percentage);
                }
                else if (contains_percent(split_file[i + 3]) == TRUE)
                {
                    char* percentage = parser_percentage(split_file[i - 2], split_file[i + 3]);
                    strcat(generic->generic_assesement_name, split_file[i + 2]);//we can asume that the word after exercise is an counter for the current exercise
                    generic->weight = strtod(percentage, NULL);
                    free(percentage);
                }
                if (generic->weight > 0.0) insertBack(grade->generic_assesement, generic);
            }
        }
        if (strcmp(split_file[i], "Letter:") == 0 || strcmp(split_file[i], "Letter") == 0)
        {
            Generic_assesement* generic = parser_generic_assesement(split_file, i);
            if (generic->weight > 0.0) insertBack(grade->generic_assesement, generic);
        }

        for (int j = 0; j < NUM_KEYWORDS; j++)
        { 
            if (strcmp(split_file[i], _key_words[j]) == 0)
            {
                Generic_assesement* generic = parser_generic_assesement(split_file, i);
                if (generic->weight > 0.0) insertBack(grade->generic_assesement, generic);
            }
        }
        if (strcmp(split_file[i], "Quizzes") == 0 || strcmp(split_file[i], "quizzes") == 0)
        {
            Generic_assesement* generic = parser_generic_assesement(split_file, i);
            if (generic->weight > 0.0) insertBack(grade->generic_assesement, generic);
        }

        if (strcmp(split_file[i], "In-Class") == 0 && strcmp(split_file[i + 1], "Activities") == 0)
        {
            Generic_assesement* generic = init_generic_assesement();
            strcat(generic->generic_assesement_name, "In-Class Activities");
            if (contains_percent(split_file[i - 1]) == TRUE || contains_percent(split_file[i + 2]) == TRUE)
            {
                char* percentage = parser_percentage(split_file[i - 1], split_file[i + 2]);
                generic->weight = strtod(percentage, NULL);
                printf("percentage for inclass = %s %.1f\n", generic->generic_assesement_name, generic->weight);
                free(percentage);
            }
            else if (contains_percent(split_file[i - 2]) == TRUE || contains_percent(split_file[i + 3])== TRUE)
            {
                char* percentage = parser_percentage(split_file[i - 2], split_file[i + 3]);
                strcat(generic->generic_assesement_name, split_file[i + 2]);//we can asume that the word after exercise is an counter for the current exercise
                generic->weight = strtod(percentage, NULL);
                printf("percentage for inclass = %s %.1f\n", generic->generic_assesement_name, generic->weight);
                free(percentage);
            }
            if (generic->weight > 0.0) insertBack(grade->generic_assesement, generic);
        }
    }  

    if (prof != NULL) insertBack(prof->grading_schema, grade);

    if (check_duplicates(prof) == TRUE)
    {
        printf("\n\nNO DUBPLCATES\n");
    }
    else
    {
        printf("\n\nFOUND A DUBPLCATES\n");
    }

    remove_after_100(prof);

    free_parser(split_file, _num_words_space);
    free_parser(split_file_title, _num_words_email_at);
    return prof;
}

char* read_file(char* file_path)
{
    FILE *file;
    if ((file = fopen(file_path, "r")) == NULL)
    {
        printf("Error: opening file");
        return NULL;
    }

    fseek(file, 0L, SEEK_END);
    int file_size = ftell(file);
    rewind(file);

    char* file_str = calloc(1, sizeof(char) * file_size);
    
    fread(file_str, 1, file_size, file);
    fclose(file); 
    return file_str;
}

/**
 * creating a JSON string to get the total weight
 */
char* total_weight_to_JSON(char* filename)
{
    if (!(strlen(filename) > 0)) return NULL;
    char* total_weight_str = calloc(1, sizeof(char) * 32);
    char* str = read_file(filename);
    Professor* prof = parse_document(str);
    free(str);

    double total = weight_total(prof);

    sprintf(total_weight_str, "{\"Total Weight\":%.1f}", total);

    return total_weight_str;
}

char* JSON_midterm(const Midterm* mid)
{
    if (mid == NULL) 
    {   
        char* empty_str = malloc(sizeof(char) + 5);
        strcpy(empty_str, "{}");
        return empty_str; 
    }
    char* midterm_str = calloc(1, sizeof(char) * WORD_LEN);
    sprintf(midterm_str, "{\"%s\":%.1f}", mid->midterm_name, mid->weight);
    return midterm_str;
}

char* JSON_assignment(const Assignment* assign)
{
    if (assign == NULL) 
    {   
        char* empty_str = malloc(sizeof(char) + 5);
        strcpy(empty_str, "{}");
        return empty_str; 
    }
    char* assign_str = calloc(1, sizeof(char) * WORD_LEN);
    sprintf(assign_str, "{\"%s\":%.1f}", assign->assignment_name, assign->weight);
    return assign_str;
}

char* JSON_generic(const Generic_assesement* generic)
{
    if (generic == NULL) 
    {   
        char* empty_str = malloc(sizeof(char) + 5);
        strcpy(empty_str, "{}");
        return empty_str; 
    }
    char* generic_str = calloc(1, sizeof(char) * WORD_LEN);
    sprintf(generic_str, "{\"%s\":%.1f}", generic->generic_assesement_name, generic->weight);
    return generic_str;
}

/**
 * Creates a JSON string that contains all the Assessments from the course outline
 */
char* JSON_assessement_list(char* filename)
{
    printf("In c function final grade = %s\n", filename);
    if (!(strlen(filename) > 0)) return NULL;
    char* str = read_file(filename);
    printf("the file is = %s\n", str);
    Professor* prof = parse_document(str);
    if (str != NULL) free(str);

    if (prof == NULL)
    { 
        char* empty_str = malloc(sizeof(char) + 10);
        strcpy(empty_str, "[]");
        return empty_str;
    }

    printf("prof->couretitel = %s\n", prof->course_title);
    char* list_json = malloc(sizeof(char) + 28);
    list_json[0] = '\0';
    strcat(list_json, "[");

    int count = 0;
    void* grading_elem_final;
    void* grading_elem_assign;
    void* grading_elem_generic;
    void* grading_elem_mid;

    void* mid_elem;
    void* assign_elem;
    void* generic_elem;

    /*Adding final exam to the string*/
    ListIterator iterator_final = createIterator(prof->grading_schema);
    while ((grading_elem_final = nextElement(&iterator_final)) != NULL)
    {
        Grading_schema* grade = (Grading_schema*)grading_elem_final;
        printf("grade->weight = %f\n", grade->weight);
        if (grade->weight > 0.0)
        {
            char* temp_str = calloc(1, sizeof(char) * WORD_LEN);
            sprintf(temp_str, "{\"Final Exam\":%.1f}", grade->weight);
            strcat(list_json, temp_str);
            strcat(list_json, ",");
            free(temp_str);
        }
    }

    /* Add Midterms to the JSON string*/
    ListIterator iterator = createIterator(prof->grading_schema);
    while ((grading_elem_mid = nextElement(&iterator)) != NULL)
    {
        Grading_schema* grade = (Grading_schema*)grading_elem_mid;

        ListIterator mid_iter = createIterator(grade->midterms);
        while ((mid_elem = nextElement(&mid_iter)) != NULL)
        {
            Midterm* midterm = (Midterm*)mid_elem;
            char* str = JSON_midterm(midterm);
            list_json = (char*)realloc(list_json, sizeof(char) * 
                            (strlen(str) + WORD_LEN)); //make dynamic
            if (count >= 1)
            {
                list_json = realloc(list_json, sizeof(char) * WORD_LEN);
                strcat(list_json, ",");
            }
            count++;


            strcat(list_json, str);
            free(str);
        }
        if (count > 0 && (checkIfNextStructExists(prof, ASSIGNMENT) == TRUE ||
                    checkIfNextStructExists(prof, GENERIC_ASSESEMENT)))
        {
            list_json = realloc(list_json, sizeof(char) * WORD_LEN);
            strcat(list_json, ",");
        }
    }
    count = 0;

    /* Add Assignments to the JSON string*/
    ListIterator iterator_1 = createIterator(prof->grading_schema);
    while ((grading_elem_assign = nextElement(&iterator_1)) != NULL)
    {
        Grading_schema* grade = (Grading_schema*)grading_elem_assign;

        ListIterator ass_iter = createIterator(grade->assignments);
        while ((assign_elem = nextElement(&ass_iter)) != NULL)
        {
            Assignment* assign = (Assignment*)assign_elem;
            char* str = JSON_assignment(assign);
            list_json = (char*)realloc(list_json, sizeof(char) * 
                            (strlen(str) + WORD_LEN)); //make dynamic
            if (count >= 1)
            {
                list_json = realloc(list_json, sizeof(char) * WORD_LEN);
                strcat(list_json, ",");
            }

            count++;
          
            strcat(list_json, str);
            free(str);
        }
        if (count > 0 && checkIfNextStructExists(prof, GENERIC_ASSESEMENT) == TRUE)
        {
            list_json = realloc(list_json, sizeof(char) * WORD_LEN);
            strcat(list_json, ",");
        }
    }
    count = 0;

    /* Add Generic Assessements to the JSON string*/
    ListIterator iterator_2 = createIterator(prof->grading_schema);
    while ((grading_elem_generic = nextElement(&iterator_2)) != NULL)
    {
        Grading_schema* grade = (Grading_schema*)grading_elem_generic;

        ListIterator ass_iter = createIterator(grade->generic_assesement);
        while ((generic_elem = nextElement(&ass_iter)) != NULL)
        {
            Generic_assesement* generic = (Generic_assesement*)generic_elem;
            char* str = JSON_generic(generic);
            list_json = (char*)realloc(list_json, sizeof(char) * 
                            (strlen(str) + WORD_LEN)); //make dynamic
            if (count >= 1)
            {
                list_json = realloc(list_json, sizeof(char) * WORD_LEN);
                strcat(list_json, ",");
            }
            count++;

            strcat(list_json, str);
            free(str);
        }
    }
  
    list_json = realloc(list_json, sizeof(char) * WORD_LEN);
    strcat(list_json, "]");
    
    delete_prof(prof);
    _num_words_space = 0;//resets global word count
    _num_words_star = 0;
    _num_words_email_at = 0;
    _num_words_couse_title = 0;

    return list_json;
}

char* professor_to_JSON(char* file_name)
{
    if (strlen(file_name) == 0) 
    {   
        char* empty_str = malloc(sizeof(char) + 5);
        strcpy(empty_str, "{}");
        return empty_str; 
    }
    char* prof_json_str = calloc(1, sizeof(char) * WORD_LEN);
    
    char* doc_str = read_file(file_name);
    char** split_file = split(doc_str, " ", SPACE, FALSE);
    char** split_file_title = split(doc_str, "*", STAR, FALSE);
    /*Gets the professors info email, name and name of the courese*/
    Professor* prof = parse_prof_info(split_file, split_file_title, doc_str);

    sprintf(prof_json_str, "{\"professor\":\"%s\",\"email\":\"%s\",\"course_code\":\"%s\"}",
            prof->prof_name, prof->email, prof->course_title);

    /* Resetting all word count global variables*/
    _num_words_space = 0;
    _num_words_star = 0;
    _num_words_email_at = 0;
    _num_words_couse_title = 0;

    return prof_json_str;
}



int main(int argc, char *argv[])
{
    // char* filename = "POLS_3140.pdf";
    // execute_java_program_PDF_to_TXT(filename);
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/Acct_3350.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/Outline_MCS2100DE_F19.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/CIS3090.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/cis2750.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/3210-outline-F19_v8.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/outline.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/acct3280.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/acct_2230.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/mcs_2000.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/hist_1150.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/stats_2060.txt";
    // char* path = "/Users/david/Documents/Mark_Calc_App/files/acct3340.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/MGMT_3020.txt";//major bug
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/acct_4340.txt";1
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/ACCT_4220.txt";//final exam bug
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/HROB_3030.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/acct_4270.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/acct_4230.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/acct_4220.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/hrob_2010.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/hrob_2090.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/W2020CIS4010.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/Outline-2.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/CIS4500_CourseOutline.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/W20 CIS3750 Course Outline.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/syllabusW20.txt";
    // char* path = "/Users/david/Documents/Guelph_dev/Mark_Calc_App/files/POLS_3140.txt";
    // char* path = "/Users/david/Documents/MarkCalcParserApp/files/FRHD2100DE_S20_FINAL.txt";
    // char* path = "/Users/david/Documents/MarkCalcParserApp/files/RSM321+COURSE+OULTINE+F19+revised.txt";
    // char* path = "/Users/david/Documents/MarkCalcParserApp/files/GDipPA+Course+Outline+Advanced+Financial+Reporting+RSM+7201+Summer+2020+v3.txt";

    // char* path = "/Users/david/Documents/MarkCalcParserApp/files/acct_4220.txt";
    // char* path = "/Users/david/Documents/MarkCalcParserApp/files/acct_4270.txt";
    // char* path = "/Users/david/Documents/MarkCalcParserApp/files/acct_4230.txt";
    // char* path = "/Users/david/Documents/MarkCalcParserApp/files/stats_2060.txt";
    char* path = "/Users/david/Documents/MarkCalcParserApp/files/1022G-western.txt";


    // char* path = "/Users/david/Documents/MarkCalcParserApp/files/MGMT_3020.txt";//major bug










    char* str = read_file(path);
    Professor* prof = parse_document(str);
    free(str);
    doc_to_string(prof);

    printf("Total weight = %.1f\n", weight_total(prof));

    // delete_prof(prof);

    // printf("%s\n", JSON_assessement_list(path));
    // printf("%s\n", professor_to_JSON(path));



    printf("done\n");
    return 0;
}





/*Possible token function*/

// char** split_string(char* str) {
//     char** splits = NULL;
//     char* token = strtok(str, " ");

//     int spaces = 0;

//     while (token) {
//         splits = realloc(splits, sizeof(char*) * ++spaces);

//         if (!splits) {
//             return splits;
//         }

//         splits[spaces - 1] = token;

//         token = strtok(NULL, " ");
//     }

//     return splits;
// }              
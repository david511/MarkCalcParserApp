
#ifndef OUTLINE_PARSER_H
#define OUTLINE_PARSER_H

#include "LinkedListAPI.h"


/*Helps with finding the word count for the split parser function*/
typedef enum
{
    SPACE,
    STAR,
    EMAIL_AT,
    GENERIC,
    GENERIC_TEMP,
    GENERIC_BACK,
    COURSE_TITLE,
    REMOVE_SPACE
} Parse_type;

typedef enum
{
    PERCENT,
    NON_PERCENT
} Is_digit_type;

typedef struct
{
    char* assignment_name;
    double weight;
} Assignment;

typedef struct
{
    char* midterm_name;
    double weight;
} Midterm;

typedef struct
{
    char* generic_assesement_name;
    double weight;
} Generic_assesement;

typedef struct
{
    char* final_exam;
    double weight;
    List* midterms;
    List* assignments; 
    List* generic_assesement;
} Grading_schema;

typedef struct
{
    char* prof_name;
    char* email;
    char* course_title;
    List* grading_schema;
} Professor;

int execute_java_program_PDF_to_TXT(char* file_name);
int compare_assignment(const void *first, const void *second);
void delete_assignment(void* data);
char* assignment_toString(void* data);
int compare_midterm(const void *first, const void *second);
void delete_midterm(void* data);
char* midterm_toString(void* data);
int compare_generic(const void *first, const void *second);
void delete_generic(void* data);
char* generic_toString(void* data);
int compare_grades(const void *first, const void *second);
void delete_grades(void* data);
char* grade_to_string(void* data);

char** split(char* line, char* delm, Parse_type type, int check_space);

char* _program_name[13] = {
    "ACCT",
    "CIS",
    "MCS",
    "STAT",
    "HIST",
    "MGMT",
    "HROB",
    "POLS",
    "FRHD"
};

char _key_words[68][32] = {
    "Presentation",
    "Presentation:",
    "presentation",
    "presentation:",
    "Report",
    "Report:",
    "report",
    "report:"
    "Reports",
    "Reports:",
    "report)",
    "PAPER",
    "Essay:",
    "Essay",
    "essay",
    "essay:",
    "Project:",
    "Project",
    "Projects",
    "Projects:",
    "project:",
    "project",
    "project:",
    "Test",
    "Test:",
    "Tests",
    "Tests:",
    "test:",
    "test",
    "tests",
    "Discussion:",
    "Discussion",
    "Discussions",
    "Discussions::",
    "discussion:",
    "discussions",
    "Reflections",
    "Reflection:",
    "Reflection",
    "reflection",
    "reflection:",
    "Term:",
    "Term",
    "Terms",
    "term:",
    "term",
    "Abstract:",
    "Abstract",
    "Abstracts",
    "abstract",
    "Client:",
    "Client",
    "Case:",
    "Case",
    "case",
    "Response:",
    "Response",
    "Homework:",
    "Homework",
    "homework:",
    "homework",
    "outline",
    "Exercises:",
    "Exercises",
    "exercises",
    "classroom",
    "Simulation",
    "Peer",
    "Portfolio"
};

#endif
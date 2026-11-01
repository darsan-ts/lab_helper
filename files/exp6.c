6th exp

#include <stdio.h>
#include <string.h>
int main() {
    char surname[50];
    char firstname[50];
    char name[50];
    char copy[50];
    int len;

    printf("enter the firstname:  ");
    scanf("%s",&firstname);
    printf("enter the surname:  ");
    scanf("%s",surname);
    printf("%s%s",surname,firstname);
    strcpy(name,firstname);
    strcat(name,surname);
    printf("%s",firstname);
    len=strlen(name);
    printf("%d",len);
    
    
}
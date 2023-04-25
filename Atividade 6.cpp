#include <stdio.h>
#include <stdlib.h>

int main() {
    float numReal;
    
    printf("Informe o numero real: ");
    scanf("%f", &numReal);
    
    int parteInteira = (int)numReal;
    
    printf("A parte inteira do numero digitado e: %d\n", parteInteira);
    
}


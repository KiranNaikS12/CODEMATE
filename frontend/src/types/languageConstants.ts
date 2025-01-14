export const LANGUAGE_VERSION = {
  javascript: "18.15.0",
  python: "3.10.0",
  java: "15.0.2",
  csharp: "6.12.0",
  php: "8.2.3"
}


export const CODE_SNIPPETS = {
  javascript: `
function func(arr) {
  
}
`,

  python: `
def func():
`,

  java: `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World");
    }
}
`,

  csharp: `
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World");
    }
}
`,
 php: `<?php
function greet($name) {
    echo "Hello, " . $name;
}

greet("World"); 
?>`
};

export type Language = keyof typeof CODE_SNIPPETS;

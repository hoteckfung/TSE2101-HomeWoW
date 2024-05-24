class User {
    constructor(name, age, email) {
        this.name = name;
        this.age = age;
        this.email = email;
    }

    sayHello() {
        console.log(`Hello, my name is ${this.name}!`);
    }
}

#include <string>

std::string sayHello(std::string name) {
  return "Hello, " + name + "!\n";
}

#include "nbind/nbind.h"

NBIND_GLOBAL() {
  function(sayHello);
}

CLASSPATH=$(JARS=(target/lib/*.jar target/overlap-*-SNAPSHOT.jar); IFS=:; echo "${JARS[*]}")

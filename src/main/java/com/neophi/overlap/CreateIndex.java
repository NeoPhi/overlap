package com.neophi.overlap;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Date;

import org.apache.commons.io.FileUtils;
import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.Field.Index;
import org.apache.lucene.document.Field.Store;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;

public class CreateIndex {
	public static void main(final String args[]) throws IOException {
		if (args.length != 2) {
			System.out.println("Usage: CreateIndex titles.tsv directory");
			System.exit(1);
		}
		EnglishAnalyzer englishAnalyzer = new EnglishAnalyzer(Version.LUCENE_36);
		IndexWriterConfig indexWriterConfig = new IndexWriterConfig(Version.LUCENE_36, englishAnalyzer);
		File outputDirectory = new File(args[1]);
		if (outputDirectory.exists()) {
			System.out.println("Removing old directory");
			FileUtils.deleteDirectory(outputDirectory);
		}
		System.out.println("Creating index at " + outputDirectory);
		IndexWriter indexWriter = new IndexWriter(FSDirectory.open(outputDirectory), indexWriterConfig);
		
		FileInputStream input = new FileInputStream(args[0]);
		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(input));
		String line;
		int count = 0;
		while ((line = bufferedReader.readLine()) != null) {
			String parts[] = line.split("\t");
			String id = parts[0];
			String name = parts[1];
			String year = parts[2];
			String type = parts[3];
			Document document = new Document();
			document.add(new Field("id", id, Store.YES, Index.NO));
			document.add(new Field("name", name, Store.YES, Index.ANALYZED));
			document.add(new Field("year", year, Store.YES, Index.NOT_ANALYZED));
			document.add(new Field("type", type, Store.YES, Index.NOT_ANALYZED));
			indexWriter.addDocument(document);
			count += 1;
			if ((count % 10000) == 0) {
				System.out.println(new Date().toString() + " " + count);
			}
		}
		indexWriter.close();
		System.out.println("Imported " + count);
	}
}

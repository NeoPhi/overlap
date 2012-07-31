package com.neophi.overlap;

import java.io.File;
import java.io.IOException;

import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;

public class QueryIndex {
	public static void main(final String args[]) throws IOException, ParseException {
		if (args.length != 2) {
			System.out.println("Usage: QueryIndex directory query");
			System.exit(1);
		}
		EnglishAnalyzer englishAnalyzer = new EnglishAnalyzer(Version.LUCENE_36);
		File outputDirectory = new File(args[0]);
		IndexReader indexReader = IndexReader.open(FSDirectory.open(outputDirectory));
		IndexSearcher indexSearcher = new IndexSearcher(indexReader);
		QueryParser queryParser = new QueryParser(Version.LUCENE_36, "name", englishAnalyzer);

		String queryString = args[1];
		Query query = queryParser.parse(queryString);
	    TopDocs topDocs = indexSearcher.search(query, 100);
	    System.out.println("Found " + topDocs.totalHits);
	    for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
			System.out.println(scoreDoc.score + " " + indexSearcher.doc(scoreDoc.doc));
		}
	    indexSearcher.close();
	}
}

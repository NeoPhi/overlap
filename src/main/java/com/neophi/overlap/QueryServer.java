package com.neophi.overlap;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

import org.apache.lucene.index.IndexReader;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.store.FSDirectory;
import org.jboss.netty.bootstrap.ServerBootstrap;
import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory;

import com.neophi.overlap.netty.QueryPipelineFactory;

public class QueryServer {
	public static void main(final String args[]) throws IOException,
			ParseException {
		if (args.length != 1) {
			System.out.println("Usage: QueryIndex directory");
			System.exit(1);
		}
		File outputDirectory = new File(args[0]);
		IndexReader indexReader = IndexReader.open(FSDirectory
				.open(outputDirectory));
		final IndexSearcher indexSearcher = new IndexSearcher(indexReader);

		ServerBootstrap bootstrap = new ServerBootstrap(
				new NioServerSocketChannelFactory(
						Executors.newCachedThreadPool(),
						Executors.newCachedThreadPool()));

		bootstrap.setPipelineFactory(new QueryPipelineFactory(indexSearcher));
		bootstrap.bind(new InetSocketAddress(8080));
		System.out.println("Server ready");
	}
}

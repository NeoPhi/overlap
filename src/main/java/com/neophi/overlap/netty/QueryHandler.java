package com.neophi.overlap.netty;

import java.util.List;
import java.util.Map;

import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.util.Version;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpHeaders;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.handler.codec.http.HttpResponse;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;
import org.jboss.netty.handler.codec.http.HttpVersion;
import org.jboss.netty.handler.codec.http.QueryStringDecoder;
import org.jboss.netty.util.CharsetUtil;

import com.google.gson.Gson;

public class QueryHandler extends SimpleChannelUpstreamHandler {
	private IndexSearcher indexSearcher;

	private EnglishAnalyzer englishAnalyzer = new EnglishAnalyzer(
			Version.LUCENE_36);

	public QueryHandler(IndexSearcher indexSearcher) {
		this.indexSearcher = indexSearcher;
	}

	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e)
			throws Exception {
		HttpRequest request = (HttpRequest) e.getMessage();

		QueryStringDecoder queryStringDecoder = new QueryStringDecoder(
				request.getUri());
		Map<String, List<String>> params = queryStringDecoder.getParameters();

		if (!params.containsKey("query")) {
			send404(request, e);
			return;
		}
				
		String queryString = params.get("query").get(0);
		QueryParser queryParser = new QueryParser(Version.LUCENE_36, "name",
				englishAnalyzer);

		Query query = queryParser.parse(queryString);
		TopDocs topDocs = indexSearcher.search(query, 100);
		QueryResponse queryResponse = new QueryResponse();
		queryResponse.totalMatchesFound = topDocs.totalHits;
		for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
			Document document = indexSearcher.doc(scoreDoc.doc);
			Title title = new Title();
			title.id = document.get("id");
			title.name = document.get("name");
			title.year = document.get("year");
			title.type = document.get("type");
			queryResponse.titles.add(title);
		}
		writeResponse(request, e, queryResponse);

	}

	private void send404(HttpRequest request, MessageEvent e) {
		HttpResponse response = new DefaultHttpResponse(HttpVersion.HTTP_1_1,
				HttpResponseStatus.NOT_FOUND);
		ChannelFuture future = e.getChannel().write(response);
		future.addListener(ChannelFutureListener.CLOSE);
	}
	
	private void writeResponse(HttpRequest request, MessageEvent e,
			QueryResponse queryResponse) {
		Gson gson = new Gson();

		boolean keepAlive = HttpHeaders.isKeepAlive(request);

		HttpResponse response = new DefaultHttpResponse(HttpVersion.HTTP_1_1,
				HttpResponseStatus.OK);
		response.setContent(ChannelBuffers.copiedBuffer(
				gson.toJson(queryResponse), CharsetUtil.UTF_8));
		response.setHeader(HttpHeaders.Names.CONTENT_TYPE,
				"application/json; charset=UTF-8");
		if (keepAlive) {
			response.setHeader(HttpHeaders.Names.CONTENT_LENGTH, response
					.getContent().readableBytes());
			response.setHeader(HttpHeaders.Names.CONNECTION,
					HttpHeaders.Values.KEEP_ALIVE);
		}
		ChannelFuture future = e.getChannel().write(response);

		if (!keepAlive) {
			future.addListener(ChannelFutureListener.CLOSE);
		}
	};

	@Override
	public void exceptionCaught(ChannelHandlerContext ctx, ExceptionEvent e)
			throws Exception {
		e.getCause().printStackTrace();
		e.getChannel().close();
	}
}

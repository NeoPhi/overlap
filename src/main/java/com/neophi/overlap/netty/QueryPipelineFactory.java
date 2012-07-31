package com.neophi.overlap.netty;

import org.apache.lucene.search.IndexSearcher;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.Channels;
import org.jboss.netty.handler.codec.http.HttpChunkAggregator;
import org.jboss.netty.handler.codec.http.HttpRequestDecoder;
import org.jboss.netty.handler.codec.http.HttpResponseEncoder;

public class QueryPipelineFactory implements ChannelPipelineFactory {
	private IndexSearcher indexSearcher;

	public QueryPipelineFactory(IndexSearcher indexSearcher) {
		this.indexSearcher = indexSearcher;
	}

	public ChannelPipeline getPipeline() throws Exception {
		// Create a default pipeline implementation.
		ChannelPipeline pipeline = Channels.pipeline();
		pipeline.addLast("decoder", new HttpRequestDecoder());
		pipeline.addLast("aggregator", new HttpChunkAggregator(1048576));
		pipeline.addLast("encoder", new HttpResponseEncoder());
		pipeline.addLast("handler", new QueryHandler(indexSearcher));
		return pipeline;
	}

}

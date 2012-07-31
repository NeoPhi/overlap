package com.neophi.overlap.netty;

import java.util.ArrayList;
import java.util.List;

public class QueryResponse {
	public int totalMatchesFound;
	public List<Title> titles = new ArrayList<Title>(100);
}
